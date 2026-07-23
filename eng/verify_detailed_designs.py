#!/usr/bin/env python3
"""Verify the RepoFluent detailed-design tree against docs/specs."""

from __future__ import annotations

import re
from collections import Counter
from pathlib import Path

from generate_detailed_designs import (
    DESIGNS_ROOT,
    EXPERIENCE_DESIGNS,
    FEATURES,
    ROOT,
    SPECS_ROOT,
    parse_requirements,
)


STYLE_BLOCKERS = re.compile(
    r"\b(?:we|you|our|ours|us|must|very|robust|leverage|seamless|simply|obviously)\b"
    r"|shall ideally",
    re.IGNORECASE,
)


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def source_requirements() -> dict[str, tuple[str, str]]:
    source: dict[str, tuple[str, str]] = {}
    for subsystem in sorted(FEATURES):
        parsed = parse_requirements(SPECS_ROOT / subsystem / "L2.md")
        for requirement in parsed.values():
            if requirement.identifier in source:
                raise ValueError(f"duplicate source requirement {requirement.identifier}")
            source[requirement.identifier] = (
                requirement.primary_l1,
                requirement.text,
            )
    return source


def verify_feature_readmes(
    source: dict[str, tuple[str, str]], errors: list[str]
) -> tuple[int, int, Counter[str]]:
    expected_features = {
        (subsystem, slug)
        for subsystem, features in FEATURES.items()
        for slug, _, _ in features
    }
    actual_features = {
        (readme.parents[1].name, readme.parent.name)
        for readme in DESIGNS_ROOT.glob("*/*/README.md")
    }
    if expected_features != actual_features:
        fail(
            errors,
            "feature directory mismatch: "
            f"missing={sorted(expected_features - actual_features)}, "
            f"extra={sorted(actual_features - expected_features)}",
        )

    seen: Counter[str] = Counter()
    image_count = 0
    for subsystem, feature_slug in sorted(expected_features):
        readme = DESIGNS_ROOT / subsystem / feature_slug / "README.md"
        if not readme.is_file():
            continue
        text = readme.read_text(encoding="utf-8")
        headings = re.findall(r"^## (.+)$", text, re.MULTILINE)
        if headings != ["Overview", "Description", "Requirements", "Diagrams"]:
            fail(errors, f"{readme.relative_to(ROOT)}: invalid H2 sequence {headings}")

        rows = re.findall(
            r"^\| `(L2-[A-Z]+-\d+)` \| `(L1-[A-Z]+-\d+)` \| (.+) \|$",
            text,
            re.MULTILINE,
        )
        if not rows:
            fail(errors, f"{readme.relative_to(ROOT)}: no L2 requirement rows")
        requirement_ids: list[str] = []
        for requirement_id, parent_id, body in rows:
            requirement_ids.append(requirement_id)
            seen[requirement_id] += 1
            actual = (parent_id, body.replace("\\|", "|"))
            if source.get(requirement_id) != actual:
                fail(
                    errors,
                    f"{readme.relative_to(ROOT)}: source mismatch for {requirement_id}",
                )

        links = re.findall(r"!\[[^]]+\]\(([^)]+\.png)\)", text)
        image_count += len(links)
        linked_stems = {Path(link).stem for link in links}
        diagrams = readme.parent / "diagrams"
        puml_stems = {path.stem for path in diagrams.glob("*.puml")}
        png_stems = {
            path.stem
            for path in diagrams.glob("*.png")
            if path.stat().st_size > 0
        }
        for link in links:
            target = readme.parent / link
            if not target.is_file() or target.stat().st_size == 0:
                fail(errors, f"{readme.relative_to(ROOT)}: unresolved image {link}")
        if linked_stems != puml_stems or linked_stems != png_stems:
            fail(
                errors,
                f"{readme.relative_to(ROOT)}: linked/source/rendered diagram sets differ",
            )

        expected_sequences = {
            f"sequence-{requirement_id.lower()}" for requirement_id in requirement_ids
        }
        actual_sequences = {
            stem for stem in puml_stems if stem.startswith("sequence-")
        }
        if expected_sequences != actual_sequences:
            fail(
                errors,
                f"{readme.relative_to(ROOT)}: sequence coverage differs from L2 rows",
            )

        prose = text.split("## Requirements", 1)[0] + text.split("## Diagrams", 1)[1]
        prose = re.sub(r"!\[[^]]+\]\([^)]+\)", "", prose)
        blocker = STYLE_BLOCKERS.search(prose)
        if blocker:
            fail(
                errors,
                f"{readme.relative_to(ROOT)}: house-style blocker {blocker.group(0)!r}",
            )
        for sentence in re.split(r"(?<=[.!?])\s+", prose):
            if len(re.findall(r"\b[\w'-]+\b", sentence)) > 35:
                fail(
                    errors,
                    f"{readme.relative_to(ROOT)}: prose sentence exceeds 35 words",
                )
                break

    return len(actual_features), image_count, seen


def verify_diagrams(errors: list[str]) -> tuple[int, int]:
    puml_files = sorted(DESIGNS_ROOT.rglob("*.puml"))
    png_files = sorted(DESIGNS_ROOT.rglob("*.png"))
    for source in puml_files:
        rendered = source.with_suffix(".png")
        if not rendered.is_file() or rendered.stat().st_size == 0:
            fail(errors, f"{source.relative_to(ROOT)}: missing nonempty PNG sibling")

    include_by_name = {
        "c4-context.puml": "!include <C4/C4_Context>",
        "c4-container.puml": "!include <C4/C4_Container>",
        "c4-component.puml": "!include <C4/C4_Component>",
    }
    for c4 in sorted(DESIGNS_ROOT.rglob("c4-*.puml")):
        text = c4.read_text(encoding="utf-8")
        include = include_by_name.get(c4.name)
        if include is None or include not in text:
            fail(errors, f"{c4.relative_to(ROOT)}: missing expected C4 include")
        if re.search(
            r"^\s*(?:rectangle|node|component\s+[^\(]|\[[^]]+\])",
            text,
            re.MULTILINE | re.IGNORECASE,
        ):
            fail(errors, f"{c4.relative_to(ROOT)}: raw shape in C4 source")
        if "-->" in text or "<--" in text:
            fail(errors, f"{c4.relative_to(ROOT)}: bare arrow in C4 source")
        relationships = [
            line
            for line in text.splitlines()
            if re.match(r"^\s*(?:Rel|Rel_Back|BiRel|Rel_[DULR])\(", line)
        ]
        if not relationships:
            fail(errors, f"{c4.relative_to(ROOT)}: no C4 relationship macro")

    for sequence in sorted(DESIGNS_ROOT.rglob("sequence-*.puml")):
        text = sequence.read_text(encoding="utf-8")
        labels = (
            'box "Frontend — ',
            "Backend — ",
            "Application and Domain"
            if "10-experience-platform" not in sequence.parts
            else "Experience contract",
            "Infrastructure" if "10-experience-platform" not in sequence.parts else "Repository infrastructure",
        )
        if not all(label in text for label in labels):
            fail(errors, f"{sequence.relative_to(ROOT)}: architectural tier box missing")
        requirement_id = sequence.stem.removeprefix("sequence-").upper()
        if requirement_id not in text:
            fail(errors, f"{sequence.relative_to(ROOT)}: L2 trace message missing")
    return len(puml_files), len(png_files)


def verify_index(errors: list[str]) -> None:
    index = DESIGNS_ROOT / "README.md"
    if not index.is_file():
        fail(errors, "docs/detailed-designs/README.md is missing")
        return
    text = index.read_text(encoding="utf-8")
    for link in re.findall(r"\[[^]]+\]\(([^)]+/)\)", text):
        target = DESIGNS_ROOT / link
        if not target.is_dir() or not (target / "README.md").is_file():
            fail(errors, f"docs/detailed-designs/README.md: unresolved feature link {link}")


def verify_experience_assets(errors: list[str]) -> None:
    for feature_slug, design in EXPERIENCE_DESIGNS.items():
        for relative_path, _ in design["assets"]:
            if not (ROOT / relative_path).exists():
                fail(
                    errors,
                    f"10-experience-platform/{feature_slug}: missing source asset "
                    f"{relative_path}",
                )


def main() -> int:
    errors: list[str] = []
    source = source_requirements()
    feature_count, image_count, seen = verify_feature_readmes(source, errors)
    puml_count, png_count = verify_diagrams(errors)
    verify_index(errors)
    verify_experience_assets(errors)

    if set(source) != set(seen):
        fail(
            errors,
            "L2 coverage mismatch: "
            f"missing={sorted(set(source) - set(seen))}, "
            f"extra={sorted(set(seen) - set(source))}",
        )
    for requirement_id, count in seen.items():
        if count != 1:
            fail(errors, f"{requirement_id}: appears {count} times in feature tables")

    print(f"Source L2 requirements: {len(source)}")
    print(f"Feature designs: {feature_count}")
    print(f"Exact requirement rows: {sum(seen.values())}")
    print(f"README image links: {image_count}")
    print(f"PlantUML/PNG files: {puml_count}/{png_count}")
    if errors:
        print(f"Verification errors: {len(errors)}")
        for error in errors:
            print(f"  {error}")
        return 1
    print("Detailed-design verification passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
