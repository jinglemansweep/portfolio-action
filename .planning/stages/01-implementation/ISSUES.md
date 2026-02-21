# Current Issues

## General

* Light/Dark mode toggle doesn't appear to work, but theme does respect system settings
* Clicking the PDF export fails with:

PDF export failed: TypeError: can't access property "getPageSize", t.jsPDF is undefined
    js html2pdf.js:136
    r html2pdf.js:5778
    O html2pdf.js:5835
    O html2pdf.js:5828
    O html2pdf.js:16
    <anonymous> html2pdf.js:8

* When overscrolling (touchpad) near the top and bottom of the page, a white area appears (even in dark mode)

## Homepage

* LinkedIn icon on Home page doesn't work, displays Linkedin text and breaks layout slightly
* Links to Project on homepage are broken, result in a 404. Adding a "/" to "projects" works, but not sure anchor link is working

## Skills

* Instead of "years" field, we should have "start_year" so years can be calculated dynamically
* Skills (and Projects) schema should include an optional short "comment" field that is displayed near the top of the Skill/Project card component

## Projects

* Projects (and Skills) scheme should have an optional "comment" field, see Skills above
* 