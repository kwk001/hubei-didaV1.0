#!/usr/bin/env python3
"""
Resize all images in a DOCX file to fit within page dimensions.

This script ensures that all images in a Word document fit within the page
boundaries while maintaining their aspect ratios. It's particularly useful for
processing documents with Mermaid diagrams that may exceed page dimensions.

This version directly manipulates the OOXML structure to handle all image types,
including inline shapes, anchored shapes, and floating images.

Usage:
    python resize-images.py input.docx [output.docx]

If output.docx is not specified, the input file will be overwritten.

Examples:
    # Overwrite input file
    python resize-images.py document.docx

    # Save to new file
    python resize-images.py document.docx document-resized.docx
"""

import sys
import tempfile
import shutil
from pathlib import Path
from zipfile import ZipFile

try:
    from defusedxml import minidom
except ImportError:
    print("Error: defusedxml library is required.")
    print("Install it with: pip install defusedxml")
    sys.exit(1)


def resize_images_to_fit_page(docx_path, output_path=None, verbose=True):
    """
    Resize all images in a DOCX file to fit within page dimensions.

    Uses direct OOXML manipulation to handle all image types.

    Args:
        docx_path: Path to input DOCX file
        output_path: Path to output DOCX file (None = overwrite input)
        verbose: Print progress messages

    Returns:
        dict: Statistics about the resize operation
    """
    # EMU (English Metric Unit) is used in OOXML: 914400 EMU = 1 inch
    EMU_PER_INCH = 914400

    if verbose:
        print(f"Loading document: {docx_path}")

    # Create temporary directory
    temp_dir = tempfile.mkdtemp()
    try:
        # Unpack DOCX
        unpack_dir = Path(temp_dir) / "unpacked"
        with ZipFile(docx_path, 'r') as zip_file:
            zip_file.extractall(unpack_dir)

        # Read page dimensions from word/document.xml
        doc_xml_path = unpack_dir / "word" / "document.xml"
        with open(doc_xml_path, 'rb') as f:
            doc_dom = minidom.parse(f)

        # Get page size from sectPr (using default A4 if not found)
        # Default A4: 11906 x 16838 EMU (8.27" x 11.69")
        page_width_emu = 11906 * EMU_PER_INCH // 100
        page_height_emu = 16838 * EMU_PER_INCH // 100

        sect_pr = doc_dom.getElementsByTagName('w:sectPr')
        if sect_pr:
            pg_sz = sect_pr[0].getElementsByTagName('w:pgSz')
            if pg_sz:
                page_width_emu = int(pg_sz[0].getAttribute('w:w') or page_width_emu)
                page_height_emu = int(pg_sz[0].getAttribute('w:h') or page_height_emu)

        # Get margins (default: 1 inch = 1440 twips = 914400 EMU)
        left_margin_emu = EMU_PER_INCH
        right_margin_emu = EMU_PER_INCH
        top_margin_emu = EMU_PER_INCH
        bottom_margin_emu = EMU_PER_INCH

        if sect_pr:
            pg_mar = sect_pr[0].getElementsByTagName('w:pgMar')
            if pg_mar:
                # Margins are in twips (1/20 of a point, 1440 twips = 1 inch)
                # Convert to EMU: twips * 635 = EMU
                left = pg_mar[0].getAttribute('w:left')
                right = pg_mar[0].getAttribute('w:right')
                top = pg_mar[0].getAttribute('w:top')
                bottom = pg_mar[0].getAttribute('w:bottom')

                if left:
                    left_margin_emu = int(left) * 635
                if right:
                    right_margin_emu = int(right) * 635
                if top:
                    top_margin_emu = int(top) * 635
                if bottom:
                    bottom_margin_emu = int(bottom) * 635

        # Calculate available space
        max_width_emu = page_width_emu - left_margin_emu - right_margin_emu
        max_height_emu = page_height_emu - top_margin_emu - bottom_margin_emu

        if verbose:
            print(f"Page dimensions:")
            print(f"  Width: {page_width_emu / EMU_PER_INCH:.2f}\" (available: {max_width_emu / EMU_PER_INCH:.2f}\")")
            print(f"  Height: {page_height_emu / EMU_PER_INCH:.2f}\" (available: {max_height_emu / EMU_PER_INCH:.2f}\")")
            print(f"\nProcessing images...")

        # Track statistics
        total_images = 0
        resized_images = 0

        # Find all extent elements (wp:extent for inline, wp14:sizeRelH/sizeRelV for anchored)
        # These contain cx (width) and cy (height) in EMU
        extent_elements = doc_dom.getElementsByTagName('wp:extent')

        for extent in extent_elements:
            total_images += 1

            # Get current dimensions
            cx_attr = extent.getAttribute('cx')
            cy_attr = extent.getAttribute('cy')

            if not cx_attr or not cy_attr:
                continue

            original_width_emu = int(cx_attr)
            original_height_emu = int(cy_attr)

            # Calculate scale ratios - always calculate both
            width_ratio = max_width_emu / original_width_emu
            height_ratio = max_height_emu / original_height_emu

            # Use smaller ratio to ensure both dimensions fit
            scale_ratio = min(width_ratio, height_ratio)

            # Only resize if needed (scale < 1 means shrink)
            if scale_ratio < 1.0:
                new_width_emu = int(original_width_emu * scale_ratio)
                new_height_emu = int(original_height_emu * scale_ratio)

                extent.setAttribute('cx', str(new_width_emu))
                extent.setAttribute('cy', str(new_height_emu))

                # Also update a:graphic/a:graphicData/pic:pic/pic:spPr/a:xfrm/a:ext
                # wp:extent and a:graphic are siblings under wp:inline or wp:anchor
                inline_or_anchor = extent.parentNode
                if inline_or_anchor:
                    # Find a:graphic sibling
                    graphics = inline_or_anchor.getElementsByTagName('a:graphic')
                    for graphic in graphics:
                        # Update all a:ext elements within this graphic
                        ext_elements = graphic.getElementsByTagName('a:ext')
                        for ext in ext_elements:
                            ext.setAttribute('cx', str(new_width_emu))
                            ext.setAttribute('cy', str(new_height_emu))

                resized_images += 1

                if verbose:
                    print(f"  Image {total_images}: resized from "
                          f"{original_width_emu / EMU_PER_INCH:.2f}\"x{original_height_emu / EMU_PER_INCH:.2f}\" "
                          f"to {new_width_emu / EMU_PER_INCH:.2f}\"x{new_height_emu / EMU_PER_INCH:.2f}\" "
                          f"(scale: {scale_ratio:.2%})")
            else:
                if verbose:
                    print(f"  Image {total_images}: already fits "
                          f"({original_width_emu / EMU_PER_INCH:.2f}\"x{original_height_emu / EMU_PER_INCH:.2f}\")")

        # Save modified XML
        with open(doc_xml_path, 'wb') as f:
            f.write(doc_dom.toxml('utf-8'))

        # Repack DOCX
        output = output_path or docx_path
        if verbose:
            print(f"\nSaving document: {output}")

        with ZipFile(output, 'w') as zip_file:
            for file_path in unpack_dir.rglob('*'):
                if file_path.is_file():
                    zip_file.write(file_path, file_path.relative_to(unpack_dir))

        if verbose:
            print(f"\nComplete!")
            print(f"  Total images: {total_images}")
            print(f"  Resized: {resized_images}")
            print(f"  Unchanged: {total_images - resized_images}")

        return {
            'total_images': total_images,
            'resized_images': resized_images,
            'max_width': max_width_emu / EMU_PER_INCH,
            'max_height': max_height_emu / EMU_PER_INCH,
        }

    finally:
        # Cleanup temporary directory
        shutil.rmtree(temp_dir)


def main():
    """Command-line interface."""
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    input_path = Path(sys.argv[1])

    # Validate input file
    if not input_path.exists():
        print(f"Error: File not found: {input_path}")
        sys.exit(1)

    if not input_path.suffix.lower() == '.docx':
        print(f"Error: File must be a .docx file: {input_path}")
        sys.exit(1)

    # Determine output path
    output_path = None
    if len(sys.argv) >= 3:
        output_path = Path(sys.argv[2])

    # Resize images
    try:
        resize_images_to_fit_page(input_path, output_path, verbose=True)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
