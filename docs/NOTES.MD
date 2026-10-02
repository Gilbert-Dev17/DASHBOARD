
NEEDED TO ADD on dashboard:

--- ADD ---

On QuickAdd, there should be a label showing what date your adding the tasks on.

Add richText adjusters for the journals notes + (?) update tables to be saved in JSON.

add a docs/code-structure.md
+ docs for reference for local dev
+ maybe add prisma in the mix?

- about the spinner on the buttons they all have to be the same function:
<button> <spinner> {title} <button/>

ADD supabase migration files needed and probably prisma aswell?

ADD the timezone codename storing on the db for the snapshot cron_job

add loading state to notesection

--- NEED ---

need to add a dedicated/detailed view for each category + an edit category function + an edit transaction function, for all the transactions that have been done

need to add a docs situation where it describes the whole architecture of the codebase on what it should do and what it shouldn't do when generating a code.

add the budget tracker + recurring payments tracker.

redesign some of the graphs to have those square div graphs for tracking.

--NEED-- use json for the notes tab, probably add now a notes section. for creating some doc files for DASHBOARD notes/docs, progress of the updates everything needs to be documented.

need to add auto adjust height for subtasks with long textss

--- HAS ---
Has to apply the tarsi.recovery.json file for this project


--- FIX / BUG ---

bug: when adding a task on later date it kept being addded on the current date.. so needs to be fixed for some adjustments so we can add a task for something date.

fix the modal bug when adding a category it becomes to zoomed in to the point where you can't add a new category.

fix the mobile bug where things are not fitting well.

add skeleton for loading inside JournalSection.tsx

when adding a task it needs to refer from the data in front where to add 'free' task. (find a way to add one)

--- NEED TO CREATE A MARKDOWN FILE FOR THESE ---

there's a lot that needs to be fixedd