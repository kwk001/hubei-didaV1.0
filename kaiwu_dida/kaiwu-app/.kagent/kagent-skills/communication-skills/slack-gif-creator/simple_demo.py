#!/usr/bin/env python3
"""
Simple demo script showing how to use the slack-gif-creator toolkit
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from core.gif_builder import GIFBuilder
    from templates.pulse import create_pulse_animation
    from core.validators import check_slack_size
    print("✅ All imports successful")
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)

def create_simple_reaction_gif():
    """Create a simple pulsing emoji GIF for Slack"""
    print("Creating a simple reaction GIF...")

    try:
        # Create pulse animation frames
        frames = create_pulse_animation(
            object_data={'emoji': '👍', 'size': 80},
            pulse_type='smooth',
            scale_range=(0.8, 1.2),
            num_frames=12
        )

        # Build GIF
        builder = GIFBuilder(width=128, height=128, fps=10)
        for frame in frames:
            builder.add_frame(frame)

        # Save with emoji optimization
        info = builder.save('demo_reaction.gif', num_colors=40, optimize_for_emoji=True)

        print(f"GIF created with {info['frame_count']} frames")
        print(f"Duration: {info['duration_seconds']:.1f} seconds")
        print(f"Size: {info['size_kb']:.1f} KB")

        # Validate for Slack
        passes, validation_info = check_slack_size('demo_reaction.gif', is_emoji=True)
        if passes:
            print("✅ GIF meets Slack emoji requirements!")
        else:
            print("❌ GIF exceeds Slack emoji limits")
            print(f"  Size: {validation_info['size_kb']:.1f} KB (limit: 64 KB)")

        return passes
    except Exception as e:
        print(f"❌ Error creating GIF: {e}")
        return False

if __name__ == "__main__":
    create_simple_reaction_gif()