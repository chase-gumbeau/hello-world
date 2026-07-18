load("render.star", "render")
load("animation.star", "animation")

def main():
    return render.Root(
        delay = 100,
        child = render.Box(
            child = render.Column(
                expanded = True,
                main_align = "center",
                cross_align = "center",
                children = [
                    render.Text("Hello, Tidbyt!", color = "#7CFC00"),
                    animation.Transformation(
                        child = render.Box(
                            width = 8,
                            height = 2,
                            color = "#FF6B35",
                        ),
                        duration = 30,
                        delay = 0,
                        origin = animation.Origin(0.5, 0.5),
                        keyframes = [
                            animation.Keyframe(
                                percentage = 0.0,
                                transforms = [animation.Translate(-20, 0)],
                            ),
                            animation.Keyframe(
                                percentage = 1.0,
                                transforms = [animation.Translate(20, 0)],
                            ),
                        ],
                    ),
                    render.Text("64 x 32", font = "tom-thumb", color = "#888"),
                ],
            ),
        ),
    )
