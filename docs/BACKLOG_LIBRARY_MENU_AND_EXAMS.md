# Daypath Backlog Addendum — Library Menu, Categorized Notes, and Exams

Updated: 2026-08-05

This addendum expands Daypath beyond a flat note history. Notes must live inside a clear library structure and must be searchable by their source, subject, category, tags, title, and contents.

## Product goal

A user should be able to collect notes from a book, podcast, course, project, or any subject they define without facing one large undifferentiated note list. Each collection should become its own study space and should be able to generate an exam based only on the notes stored inside it.

## Menu and navigation

- Add a first-class **Library** item to the bottom navigation.
- Keep Home, Sessions, Library, Progress, and Settings above Android system navigation in gesture and three-button modes.
- Opening Library shows collections, not every note.
- Opening a collection shows only that collection’s notes and exam history.
- Pressing Library while already inside a collection returns to the collection list.

## Collection model

Supported collection types:

- Book
- Podcast
- Course
- Subject
- Project
- Other

Each collection stores:

- user-defined title;
- collection type;
- optional subject or category;
- optional description;
- creation and update dates;
- all notes assigned to that collection;
- exam attempt history.

Examples:

- Book — *Deep Work* — Productivity
- Podcast — *Hidden Brain* — Psychology
- Course — *Security Engineering* — Cybersecurity
- Subject — Network Protocols
- Project — Daypath Research

## Notes

Each note stores:

- title;
- full note text;
- optional tags;
- parent collection;
- creation and update dates.

Required behavior:

- create, edit, and delete notes inside a collection;
- never show all note bodies on the Library landing page;
- search inside a collection;
- show a readable preview rather than the entire note in list views;
- include note text as the reference answer for exams;
- preserve older v1/v2 session data when upgrading to the v3 local data model.

## Search

Global Library search must match:

- collection type;
- collection title;
- subject or category;
- collection description;
- note title;
- note body;
- note tags.

Search results remain grouped by collection. The Library landing page may show how many notes inside each collection matched the search, but it must not flatten matching notes into one large list.

Collection search must search only the notes inside the current collection.

## Context-dependent exams

A collection can create a **full exam** when it contains at least one note.

Initial deterministic exam behavior:

- create one question from every note in the selected collection;
- include the collection type, title, and subject as the exam context;
- alternate written-recall and multiple-choice matching questions when enough notes exist;
- use only the user’s stored notes as source material;
- show the saved note as the reference answer;
- allow the user to self-grade written answers;
- score multiple-choice answers automatically;
- save score, total questions, date, collection, and notes needing review;
- show recent exam results inside the collection;
- show aggregate exam progress on the Progress screen.

The app must state clearly that these exams test recall of the user’s notes. They do not verify whether the notes accurately represent the original book, podcast, course, or subject.

## Future exam improvements

- user-selectable exam length: quick, standard, full;
- exam by subject across several collections;
- question type controls;
- spaced review queue for missed notes;
- randomization without duplicate questions;
- source citations within questions;
- optional AI-generated questions using explicit user consent and only the selected collection context;
- deterministic private mode that never sends notes off the device;
- exportable exam and answer key;
- flashcards generated from selected notes;
- difficulty levels and follow-up exams focused on missed concepts.

## Privacy and safety

- Collections, notes, and exam history remain local in the current test build.
- No note contents are sent to an AI provider.
- Library deletion is separate from session-history deletion.
- Sensitive note text must never appear in notifications.
- Future sync requires encryption, explicit consent, backup/restore tests, and deletion controls.

## Accessibility

- Search and editing controls require accessible labels.
- Touch targets remain at least 48 dp where practical.
- Forms support system font scaling.
- Empty states explain the next action in plain language.
- Five bottom-menu items must remain tappable on Galaxy S24 Ultra in gesture and three-button modes.

## v0.3 acceptance criteria

- User can create a Book, Podcast, Course, Subject, Project, or Other collection.
- User can enter any collection name and optional subject/category.
- User can create, edit, delete, tag, and search notes inside a collection.
- Library search finds collection and note content while keeping results grouped.
- Library home never displays one flat list of all notes.
- User can create a full exam containing one question per note.
- Written questions can be self-graded.
- Multiple-choice questions are scored automatically.
- Exam result and review list are saved locally.
- Progress shows collection, note, and exam metrics.
- Existing reflection sessions survive migration to storage version 3.
- APK reports package `com.daypath.app`, version name `0.3.0`, and version code `3`.
