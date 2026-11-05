// Admin Columns editor content, from wpessential config/product/option-contracts/columns.json (41 options, 214 sub-settings).
// Row: [kind, label, help, values, active]. Kinds come from the Penpot kit (see docs/DESIGN/PENPOT-UI-REFERENCE.md).
// Group: [title, tier, contract id, rows].
export const CATS = [
  ['View identity and scope', [
    ['View Definition', 'Essential', 'columns.view.definition', [
      ['text', 'View Name', 'Shown in the view switcher above the list.', ['Books, editorial']],
      ['notice', 'View ID', 'Stable UUID, set on create and never reused.', ['vw_3f9c… (read-only, revisioned)']],
      ['on', 'Enabled', 'Turn the view off without deleting it.', ['Enabled']],
      ['input2', 'Target Type', 'Kind of list table this view belongs to.', ['Posts']],
      ['input2', 'Target Key', 'The exact post type, taxonomy or entity.', ['book']],
      ['seg3', 'Scope', 'Who the view is for.', ['Shared', 'Role', 'Personal'], 0],
      ['off', 'Default View', 'Open this view first for everyone in scope.', ['Make default']],
      ['input2', 'Clone From', 'Start from an existing view.', ['None']],
      ['input2', 'Default Sort', 'Column and direction used on first load.', ['Date, newest first']],
      ['chips5', 'Default Filters', 'Filters applied when the view opens.', ['Status: Published', 'Author: Any', '+ Add filter'], [0]],
    ]],
    ['View Assignment', 'Advanced', 'columns.view.assignment', [
      ['chips5', 'Roles', 'Roles that get this view. Access itself stays with Roles & Policy.', ['Administrator', 'Editor', 'Author', 'Contributor'], [0, 1]],
      ['input2', 'Users', 'Individual users that get this view.', ['Search users…']],
      ['input2', 'Capability', 'Anyone with this capability gets the view.', ['edit_others_posts']],
    ]],
    ['View Layout Policy', 'Advanced', 'columns.view.layout', [
      ['on', 'Sticky Header', 'Keep column headings visible while scrolling.', ['Sticky header']],
      ['on', 'Horizontal Scroll', 'Scroll sideways instead of squeezing columns.', ['Allow horizontal scroll']],
      ['seg3', 'Density', 'Row height for everyone in scope.', ['Compact', 'Default', 'Comfortable'], 1],
    ]],
    ['Personal Runtime Preferences', 'Essential', 'columns.preference.runtime', [
      ['on', 'Remember Chosen View', 'Each user returns to the view they last picked.', ['Remember per user']],
      ['on', 'Temporary Sort', 'Users may re-sort without changing the shared view.', ['Allow']],
      ['on', 'Temporary Filters', 'Users may filter without changing the shared view.', ['Allow']],
      ['on', 'Column Visibility', 'Users may hide columns for themselves.', ['Allow']],
      ['on', 'Personal Density', 'Users may pick their own row height.', ['Allow']],
    ]],
    ['Target Adapter', 'Essential', 'columns.target.adapter', [
      ['chips5', 'List Table', 'Which WordPress list table this view drives.', ['Posts', 'Users', 'Media', 'Comments', 'Terms', 'Custom entities', 'WooCommerce', 'Third-party'], [0]],
      ['notice', 'Adapter Status', 'Unsupported features are disabled per adapter.', ['Posts adapter: sorting, filters, inline and bulk editing available.']],
    ]],
  ]],
  ['Column definition', [
    ['Column Definition', 'Essential', 'columns.column.definition', [
      ['notice', 'Column ID', 'Stable UUID, kept when the column is renamed.', ['col_81a2… (read-only)']],
      ['text', 'Column Key', 'Machine key, unique inside this view.', ['isbn']],
      ['text', 'Column Label', 'Heading shown in the list.', ['ISBN']],
      ['input', 'Order', 'Position from the left.', ['3']],
      ['input', 'Width', 'Fixed width; empty means auto.', ['160 px']],
      ['pair', 'Min / Max Width', 'Limits when the table resizes.', ['Advanced', 'Min', '96 px', 'Max', '320 px']],
      ['seg3', 'Alignment', 'Cell content alignment.', ['Left', 'Center', 'Right'], 0],
      ['seg3', 'Responsive Priority', 'Which columns hide first on small screens.', ['High', 'Normal', 'Low'], 1],
      ['off', 'Sticky Column', 'Pin to the left while scrolling sideways.', ['Sticky']],
      ['on', 'Active', 'Show this column in the view.', ['Active']],
    ]],
    ['Primary Column & Row Actions', 'Advanced', 'columns.column.primary_actions', [
      ['input2', 'Primary Column', 'Column that carries the title link and row actions.', ['Title']],
      ['checks4', 'Row Actions', 'Links under the primary column, limited by the adapter.', ['Edit', 'Quick Edit', 'Trash', 'View', 'Duplicate']],
    ]],
  ]],
  ['Sources and formatting', [
    ['Native Property Source', 'Essential', 'columns.source.native', [
      ['input2', 'Object Property', 'A built-in property of the row object.', ['Post date']],
      ['input2', 'User Property', 'For user tables: a built-in user field.', ['Display name']],
    ]],
    ['Owner-surface Source Reference', 'Advanced', 'columns.source.owner_reference', [
      ['seg4', 'Owner', 'Module that owns the value and its rules.', ['Fields', 'Taxonomy', 'Relations', 'Media'], 0],
      ['input2', 'Reference', 'The field, taxonomy or relation to show.', ['Fields › Book details › ISBN']],
      ['notice', 'Owner Semantics', 'Validation, storage and access come from the owner.', ['Read-only here; edit the field in Custom Fields.']],
    ]],
    ['Query / Computed Source', 'Advanced', 'columns.source.query_computed', [
      ['input2', 'Query Source', 'A saved Query that returns one value per row.', ['Query › Open orders count']],
      ['notice', 'Execution', 'Runs on the server with the Query module.', ['No private query engine; cost class shown before saving.']],
    ]],
    ['Registered Source Provider', 'Expert', 'columns.source.provider', [
      ['input2', 'Computed Provider', 'A computed value registered in code.', ['wpe/reading-time']],
      ['input2', 'Custom Provider', 'A provider registered by another plugin.', ['None']],
      ['notice', 'Degraded State', 'Shown when the provider is missing.', ['Column shows “Source unavailable” instead of failing.']],
    ]],
    ['Registered Server-rendered Block', 'Expert', 'columns.source.server_block', [
      ['input2', 'Block', 'Only allowlisted server-rendered blocks.', ['core/post-excerpt']],
    ]],
    ['Arbitrary Executable Source', 'System', 'columns.safety.arbitrary_code', [
      ['notice', 'Custom PHP or JavaScript', 'Not available, by design.', ['Arbitrary code sources are rejected. Use a registered provider.']],
    ]],
    ['Display Format', 'Essential', 'columns.format.mode', [
      ['chips5', 'Format', 'How the value is shown.', ['Text', 'Safe rich text', 'Number', 'Currency', 'Percentage', 'Date', 'Date & time', 'Relative time', 'Yes / No', 'Status', 'Image', 'Media link', 'Link', 'Email', 'Chips', 'Relation items', 'Relation count', 'JSON', 'Progress', 'Rating', 'Custom provider'], [0]],
    ]],
    ['Text Formatting', 'Advanced', 'columns.format.text', [
      ['input', 'Truncate After', 'Characters before the text is cut.', ['80']],
      ['on', 'Ellipsis', 'Add “…” where text is cut.', ['Show ellipsis']],
      ['on', 'Full Text Tooltip', 'Show the full value on hover and focus.', ['Tooltip']],
      ['text', 'Empty Fallback', 'Shown when there is no value.', ['—']],
      ['pair', 'Prefix / Suffix', 'Added around the value.', ['Advanced', 'Prefix', 'ISBN ', 'Suffix', 'none']],
      ['text', 'List Separator', 'Between multiple values.', [', ']],
      ['seg3lock', 'HTML', 'What markup is allowed in the cell.', ['Plain text', 'Safe HTML', 'Strip all', 'Sanitized on the server with the safe allowlist.'], 0],
    ]],
    ['Link Formatting', 'Advanced', 'columns.format.link', [
      ['seg3', 'Link Target', 'Where the cell links.', ['Edit screen', 'View on site', 'None'], 0],
      ['off', 'New Tab', 'Open the link in a new tab.', ['New tab']],
      ['checks4', 'Rel', 'Added to external links.', ['noopener', 'noreferrer', 'nofollow']],
      ['on', 'Hide Without Permission', 'No link when the user cannot open the target.', ['Permission-aware']],
    ]],
  ]],
  ['Sorting, filtering and segments', [
    ['Sorting Policy', 'Essential', 'columns.sort.policy', [
      ['on', 'Sortable', 'Users can sort by this column.', ['Sortable']],
      ['seg3', 'Sort Mode', 'How values are compared.', ['Text', 'Number', 'Date'], 0],
      ['seg2', 'Default Direction', 'Direction on first click.', ['Ascending', 'Descending'], 0],
      ['off', 'Initial Sort', 'Sort by this column when the view opens.', ['Initial sort']],
      ['seg2', 'Empty Values', 'Where rows without a value go.', ['Last', 'First'], 0],
    ]],
    ['Filtering Policy', 'Essential', 'columns.filter.policy', [
      ['on', 'Filterable', 'Show a filter for this column.', ['Filterable']],
      ['chips5', 'Text Operators', 'For text values.', ['contains', 'equals', 'starts with', 'is empty', 'is not empty'], [0, 1, 3]],
      ['chips5', 'Number Operators', 'For numbers.', ['=', '≠', '>', '<', 'between'], [0, 2, 3, 4]],
      ['chips5', 'Date Operators', 'For dates.', ['on', 'before', 'after', 'between', 'last N days'], [1, 2, 3]],
      ['chips5', 'Entity Operators', 'For users, terms and relations.', ['is', 'is not', 'any of', 'none of'], [0, 2]],
      ['chips5', 'Yes / No Operators', 'For true or false values.', ['is yes', 'is no'], [0, 1]],
      ['seg3', 'Value Source', 'Where filter choices come from.', ['Existing values', 'Field choices', 'Free input'], 0],
      ['on', 'Saved Filters', 'Allow filters to be saved as segments.', ['Allow saving']],
      ['chips5', 'Presets', 'Ready-made filters shown as chips.', ['Missing ISBN', 'Published this week', '+ Add preset'], []],
    ]],
    ['Saved Segment Definition', 'Advanced', 'columns.segment.definition', [
      ['text', 'Segment Filters', 'Filters stored in the segment.', ['Status is Published, Genre any of Fiction']],
      ['text', 'Search Text', 'Search stored in the segment.', ['tolkien']],
      ['input2', 'Sort', 'Sort stored in the segment.', ['Title, A to Z']],
      ['input2', 'View', 'View the segment opens in.', ['Books, editorial']],
      ['seg3', 'Visibility', 'Who can see the segment.', ['Only me', 'View scope', 'Everyone'], 1],
    ]],
    ['Personal Saved Filter State', 'Advanced', 'columns.segment.user_state', [
      ['on', 'Remember My Filters', 'Saved for the user only; the shared view does not change.', ['Remember']],
    ]],
  ]],
  ['Editing and actions', [
    ['Inline Editing Policy', 'Advanced', 'columns.edit.inline', [
      ['on', 'Inline Editing', 'Edit the value directly in the cell.', ['Allow inline edit']],
      ['input2', 'Editor', 'Control used in the cell; defaults to the source field type.', ['From source (text)']],
      ['notice', 'Validation', 'Rules from the owning source.', ['Validated on the server by the field’s own rules.']],
      ['input2', 'Capability', 'Needed to edit inline.', ['edit_post (per row)']],
      ['on', 'Confirm Risky Changes', 'Ask before saving changes to status or owner.', ['Confirm']],
      ['on', 'Undo', 'Offer undo after saving.', ['Show undo']],
    ]],
    ['Bulk Editing Policy', 'Advanced', 'columns.edit.bulk', [
      ['on', 'Bulk Editing', 'Change many rows at once.', ['Allow bulk edit']],
      ['checks4', 'Allowed Operations', 'Offered for this column, based on its source.', ['Set value', 'Clear value', 'Adjust number', 'Add / remove in list', 'Shift dates']],
      ['input', 'Background After', 'Rows before the job runs in the background.', ['200']],
    ]],
    ['Bulk Selection Policy', 'Advanced', 'columns.bulk.selection', [
      ['seg2', 'Selection Scope', 'What “Select all” means.', ['Current page', 'All matching rows'], 0],
    ]],
    ['WordPress Quick Edit Integration', 'Advanced', 'columns.quick_edit.integration', [
      ['on', 'Quick Edit', 'Show this column in WordPress Quick Edit.', ['Include in Quick Edit']],
    ]],
    ['Quick Add Policy', 'Advanced', 'columns.quick_add.policy', [
      ['off', 'Quick Add', 'Create a row from the list without opening the editor.', ['Allow quick add']],
      ['chips5', 'Form Fields', 'Fields asked for; required fields are always included.', ['Title', 'ISBN', 'Author', '+ Add field'], [0, 1]],
    ]],
    ['Bulk Delete Policy', 'Expert', 'columns.delete.bulk', [
      ['seg3lock', 'Bulk Delete', 'Deleting many rows at once.', ['Off', 'Trash only', 'Delete permanently', 'Needs Policy permission and an impact preview.'], 1],
    ]],
  ]],
  ['Conditions, visibility and search', [
    ['Conditional Formatting', 'Advanced', 'columns.formatting.conditional', [
      ['on', 'Conditional Formatting', 'Style cells by rules.', ['Enabled']],
      ['textarea', 'Rules', 'Checked top to bottom; first match wins. Never runs code.', ['If Stock < 5 → Warning chip\nIf Status = Draft → Muted text']],
      ['seg2', 'Rule Order', 'When several rules match.', ['First match', 'All matches'], 0],
    ]],
    ['Visibility Policy', 'Advanced', 'columns.visibility.policy', [
      ['seg3lock', 'Show Column To', 'Hides the column only; data access is not changed.', ['Everyone in view', 'Roles', 'Rule', 'Visibility is presentation, never authorization.'], 0],
    ]],
    ['Search Inclusion Policy', 'Advanced', 'columns.search.policy', [
      ['seg3', 'Include in Search', 'Whether list search looks in this column.', ['Yes', 'No', 'Only if indexed'], 2],
    ]],
  ]],
  ['Export, performance and portability', [
    ['Export Policy', 'Advanced', 'columns.export.policy', [
      ['on', 'Export', 'Allow CSV export of this view.', ['Allow export']],
      ['seg3', 'Rows', 'Which rows are exported.', ['Selected', 'Current page', 'All matching'], 2],
      ['seg2', 'Columns', 'Which columns are exported.', ['Visible columns', 'Choose columns'], 0],
      ['on', 'Use Current Filters', 'Apply the filters on screen.', ['Current filters']],
      ['on', 'Use Current Sort', 'Keep the order on screen.', ['Current sort']],
      ['seg2', 'Values', 'Stored or displayed values.', ['Displayed', 'Raw'], 0],
      ['input2', 'Permission', 'Needed to export.', ['export (Policy)']],
      ['input', 'Background After', 'Rows before export runs in the background.', ['5000']],
      ['seg3', 'Delimiter', 'Between values.', [',', ';', 'Tab'], 0],
      ['input2', 'Encoding', 'File encoding.', ['UTF-8 with BOM']],
      ['on', 'Headings Row', 'First row has column labels.', ['Include headings']],
      ['input2', 'Timezone', 'For dates in the file.', ['Site timezone']],
    ]],
    ['Performance & Lazy Delivery Policy', 'Expert', 'columns.performance.policy', [
      ['seg3', 'Cache', 'Cache computed values.', ['Off', 'Per request', 'Persistent'], 1],
      ['seg3', 'Lazy Loading', 'Load slow columns after the table.', ['Off', 'On scroll', 'On demand'], 0],
      ['text', 'Lazy Error Text', 'Shown if a lazy value fails.', ['Couldn’t load. Retry']],
      ['notice', 'Sort and Filter While Lazy', 'Lazy columns cannot be sorted or filtered.', ['Sorting and filtering turn off when lazy loading is on.']],
    ]],
    ['Definition Portability', 'Advanced', 'columns.portability.policy', [
      ['seg2', 'Export Definition', 'Save this view as a file.', ['JSON', 'PHP array'], 0],
      ['text', 'Import Definition', 'Load a saved view.', ['Choose file…']],
      ['input2', 'Map Target', 'Re-map the post type or fields on import.', ['book → book']],
    ]],
    ['Compatibility Adapter Binding', 'Expert', 'columns.compatibility.adapter', [
      ['checks4', 'Adapters', 'Read values from other field plugins.', ['ACF / SCF', 'Meta Box', 'JetEngine', 'WooCommerce']],
    ]],
  ]],
  ['Safety guarantees', [
    ['Backend Truth Guarantees', 'System', 'columns.safety.backend_truth', [
      ['notice', 'Sorting on the Server', 'Always on.', ['Sorting runs in the database query, never on the visible page only.']],
      ['notice', 'Unavailable Sort Reason', 'Always on.', ['A disabled sort says why, e.g. “computed value”.']],
      ['notice', 'Expensive Sort Warning', 'Always on.', ['Slow sorts show a warning before running.']],
      ['notice', 'Search on the Server', 'Always on.', ['Search covers all rows, not just the loaded page.']],
    ]],
    ['Edit Conflict & Audit Guarantees', 'System', 'columns.safety.edit_audit_conflict', [
      ['notice', 'Edit Conflicts', 'Always on.', ['If someone else saved first, you see both values before overwriting.']],
      ['notice', 'Audit Trail', 'Always on.', ['Every inline and bulk edit is logged with before and after.']],
    ]],
    ['Bulk / Delete Safety Guarantees', 'System', 'columns.safety.bulk_delete', [
      ['notice', 'Query-backed Selection', 'Always on.', ['“All matching” re-runs the query; it never trusts a stale list.']],
      ['notice', 'Delete Impact Preview', 'Always on.', ['Shows counts and linked items before deleting.']],
    ]],
    ['Accessibility & Authorization Guarantees', 'System', 'columns.safety.accessibility_authorization', [
      ['notice', 'Not Colour Only', 'Always on.', ['Conditional styles always add an icon or text, not colour alone.']],
      ['notice', 'Visibility Is Not Access', 'Always on.', ['Hidden columns stay protected by Roles & Policy.']],
    ]],
    ['Export Safety Guarantees', 'System', 'columns.safety.export', [
      ['notice', 'Privacy Redaction', 'Always on.', ['Fields marked private are removed from exports.']],
      ['notice', 'Formula Injection', 'Always on.', ['Cells starting with = + - @ are escaped for spreadsheets.']],
    ]],
    ['Performance Guarantees', 'System', 'columns.safety.performance', [
      ['notice', 'No N+1 Queries', 'Always on.', ['Values load in batches per page.']],
      ['notice', 'Query Budget', 'Always on.', ['Each view has a query limit; extra columns go lazy.']],
      ['notice', 'Cache Invalidation', 'Always on.', ['Cached values clear when the source changes.']],
      ['notice', 'Heavy Block Guard', 'Always on.', ['Slow server-rendered blocks are stopped and flagged.']],
      ['notice', 'Batch Hydration', 'Always on.', ['Related objects are fetched once per page.']],
      ['notice', 'Cost Class', 'Always on.', ['Each column shows Low, Medium or High cost.']],
    ]],
    ['Portability Degraded-state Guarantee', 'System', 'columns.safety.portability', [
      ['notice', 'Missing Imported Sources', 'Always on.', ['Imported columns with a missing source stay, marked “Source missing”.']],
    ]],
    ['Permission-safe Segment Sharing', 'System', 'columns.safety.segment_share', [
      ['notice', 'Shared Segment Links', 'Always on.', ['A shared link only shows rows the opener may see.']],
    ]],
  ]],
];

export const BOARDS = [
  ['13a · Admin Columns · View and columns', 0, 1],
  ['13b · Admin Columns · Sources and formatting', 2, 2],
  ['13c · Admin Columns · Sorting, filters and editing', 3, 4],
  ['13d · Admin Columns · Conditions, export and performance', 5, 6],
  ['13e · Admin Columns · Safety guarantees', 7, 7],
];
