#!/usr/bin/env python3
"""Verify the RepoFluent platform and subsystem high-level design tree."""

from __future__ import annotations

import re
from pathlib import Path

from generate_high_level_designs import DESIGNS_ROOT, ROOT, SUBSYSTEMS


STYLE_BLOCKERS = re.compile(
    r"\b(?:we|you|our|ours|us|must|very|robust|leverage|seamless|simply|obviously)\b"
    r"|shall ideally",
    re.IGNORECASE,
)


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def verify_tree(errors: list[str]) -> None:
    expected = {subsystem.slug for subsystem in SUBSYSTEMS}
    spec_subsystems = {
        path.name
        for path in (ROOT / "docs" / "specs").iterdir()
        if path.is_dir() and (path / "L1.md").is_file()
    }
    actual = {
        path.name
        for path in DESIGNS_ROOT.iterdir()
        if path.is_dir() and path.name != "diagrams"
    }
    if expected != spec_subsystems:
        fail(
            errors,
            f"generator subsystem map differs from specs: missing={sorted(spec_subsystems - expected)}, extra={sorted(expected - spec_subsystems)}",
        )
    if actual != expected:
        fail(
            errors,
            f"HLD subsystem folders differ: missing={sorted(expected - actual)}, extra={sorted(actual - expected)}",
        )


def prose_without_tables(text: str) -> str:
    lines = []
    for line in text.splitlines():
        if line.startswith("|") or re.match(r"^[-:| ]+$", line):
            continue
        if line.startswith("!["):
            continue
        lines.append(f"{line}." if line.startswith("- ") else line)
    return "\n".join(lines)


def verify_readmes(errors: list[str]) -> tuple[int, int]:
    readmes = [DESIGNS_ROOT / "README.md"] + [
        DESIGNS_ROOT / subsystem.slug / "README.md" for subsystem in SUBSYSTEMS
    ]
    image_links = 0
    for readme in readmes:
        if not readme.is_file():
            fail(errors, f"{readme.relative_to(ROOT)}: missing")
            continue
        text = readme.read_text(encoding="utf-8")
        headings = re.findall(r"^## (.+)$", text, re.MULTILINE)
        if headings != ["Overview", "Description", "Diagrams"]:
            fail(errors, f"{readme.relative_to(ROOT)}: invalid H2 sequence {headings}")
        if "## Requirements" in text or re.search(r"\bL2-[A-Z]+-\d+\b", text):
            fail(errors, f"{readme.relative_to(ROOT)}: contains excluded L2 requirements content")

        links = re.findall(r"!\[[^]]+\]\(([^)]+\.png)\)", text)
        image_links += len(links)
        expected_count = 6 if readme == DESIGNS_ROOT / "README.md" else 3
        if len(links) != expected_count:
            fail(
                errors,
                f"{readme.relative_to(ROOT)}: expected {expected_count} image links, found {len(links)}",
            )
        for link in links:
            target = readme.parent / link
            if not target.is_file() or target.stat().st_size == 0:
                fail(errors, f"{readme.relative_to(ROOT)}: unresolved image {link}")

        diagram_dir = readme.parent / "diagrams"
        linked_stems = {Path(link).stem for link in links}
        source_stems = {path.stem for path in diagram_dir.glob("*.puml")}
        rendered_stems = {
            path.stem for path in diagram_dir.glob("*.png") if path.stat().st_size > 0
        }
        if linked_stems != source_stems or linked_stems != rendered_stems:
            fail(
                errors,
                f"{readme.relative_to(ROOT)}: linked/source/rendered diagram sets differ",
            )

        prose = prose_without_tables(text)
        blocker = STYLE_BLOCKERS.search(prose)
        if blocker:
            fail(
                errors,
                f"{readme.relative_to(ROOT)}: house-style blocker {blocker.group(0)!r}",
            )
        for sentence in re.split(r"(?<=[.!?])\s+", prose):
            word_count = len(re.findall(r"\b[\w'-]+\b", sentence))
            if word_count > 35:
                fail(
                    errors,
                    f"{readme.relative_to(ROOT)}: prose sentence has {word_count} words: {sentence[:120]!r}",
                )
                break

    return len(readmes), image_links


def verify_diagrams(errors: list[str]) -> tuple[int, int]:
    sources = sorted(DESIGNS_ROOT.rglob("*.puml"))
    rendered = sorted(DESIGNS_ROOT.rglob("*.png"))
    for source in sources:
        sibling = source.with_suffix(".png")
        if not sibling.is_file() or sibling.stat().st_size == 0:
            fail(errors, f"{source.relative_to(ROOT)}: missing nonempty PNG sibling")

    expected_include = {
        "c4-context.puml": "!include <C4/C4_Context>",
        "c4-container.puml": "!include <C4/C4_Container>",
        "c4-component.puml": "!include <C4/C4_Component>",
    }
    for c4 in sorted(DESIGNS_ROOT.rglob("c4-*.puml")):
        text = c4.read_text(encoding="utf-8")
        include = expected_include.get(c4.name)
        if include is None or include not in text:
            fail(errors, f"{c4.relative_to(ROOT)}: missing expected C4 include")
        if re.search(
            r"^\s*(?:rectangle|node|component\s+[^\(]|\[[^]]+\])",
            text,
            re.MULTILINE | re.IGNORECASE,
        ):
            fail(errors, f"{c4.relative_to(ROOT)}: raw shape in C4 source")
        if "-->" in text or "<--" in text:
            fail(errors, f"{c4.relative_to(ROOT)}: bare relationship arrow in C4 source")
        if not re.search(r"^\s*(?:Rel|Rel_Back|BiRel|Rel_[DULR])\(", text, re.MULTILINE):
            fail(errors, f"{c4.relative_to(ROOT)}: no C4 relationship macro")

    for sequence in sorted(DESIGNS_ROOT.rglob("sequence-*.puml")):
        text = sequence.read_text(encoding="utf-8")
        required_boxes = (
            "Frontend — ",
            "Backend — RepoFluent API application",
            "Backend — RepoFluent Application and Domain",
            "Backend — RepoFluent Infrastructure",
        )
        if not all(label in text for label in required_boxes):
            fail(errors, f"{sequence.relative_to(ROOT)}: architectural tier box missing")
    return len(sources), len(rendered)


def verify_platform_inventory(errors: list[str]) -> None:
    text = (DESIGNS_ROOT / "README.md").read_text(encoding="utf-8")
    executables = (
        "`repofluent-app`",
        "`RepoFluent.Api`",
        "`RepoFluent.Worker`",
        "`RepoFluent.ContractCli`",
        "`RepoFluent.Migrator`",
    )
    infrastructure = (
        "Relational database",
        "Encrypted object storage",
        "Durable message broker",
        "Distributed cache",
        "Search service",
        "Enterprise identity provider",
        "Key and secret management",
        "OpenTelemetry collector",
        "Backup vault",
        "CI/CD",
    )
    for item in executables + infrastructure:
        if item not in text:
            fail(errors, f"platform README omits inventory item {item!r}")
    for subsystem in SUBSYSTEMS:
        if f"({subsystem.slug}/)" not in text:
            fail(errors, f"platform README omits subsystem link {subsystem.slug}")


def main() -> int:
    errors: list[str] = []
    verify_tree(errors)
    readme_count, image_link_count = verify_readmes(errors)
    puml_count, png_count = verify_diagrams(errors)
    verify_platform_inventory(errors)

    print(f"High-level design READMEs: {readme_count}")
    print(f"Subsystem HLD folders: {len(SUBSYSTEMS)}")
    print(f"README image links: {image_link_count}")
    print(f"PlantUML/PNG files: {puml_count}/{png_count}")
    if errors:
        print(f"Verification errors: {len(errors)}")
        for error in errors:
            print(f"  {error}")
        return 1
    print("High-level design verification passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
