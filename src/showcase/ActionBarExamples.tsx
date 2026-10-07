import { SaveActionBarDemo } from './demos/action-bar'

export function ActionBarExamples() {
  return (
    <>
      <section className="doc-section">
        <h2>Save and discard</h2>
        <p>
          Use a docked, sticky bar for form changes. Edit the workspace name or notification setting
          to try it.
        </p>
        <SaveActionBarDemo />
      </section>
      <section className="doc-section">
        <h2>Placement and keyboard behavior</h2>
        <ul className="doc-list">
          <li>
            Floating bars work well for selected rows. Docked bars give forms and checkout flows a
            consistent action area.
          </li>
          <li>
            Fixed placement attaches to the viewport; sticky placement stays inside a scroll
            container; inline placement is useful for previews and embedded panels.
          </li>
          <li>
            The toolbar never moves focus when it appears. Tab enters the action group; Left/Right,
            Home, and End move between available actions. Tab exits normally.
          </li>
          <li>
            Escape dismisses a dismissible bar when focus is inside it. A nested menu handles its
            own Escape. Clicking elsewhere keeps the selection active.
          </li>
          <li>
            Use returnFocusRef for a stable return target, especially if an action removes selected
            rows. Keep selection announcements in a persistent live region.
          </li>
          <li>
            Reserve bottom space for a fixed bar so it does not cover page content. Inside a dialog,
            use sticky/inline placement or disable the portal.
          </li>
        </ul>
      </section>
      <section className="doc-section">
        <h2>Pattern references</h2>
        <p>
          The selection workflow follows Chakra’s Action Bar pattern; Radix Toolbar supplies roving
          keyboard focus. Styling and motion use Vagabond’s own tokens.
        </p>
        <div className="source-links">
          <a
            href="https://www.chakra-ui.com/docs/components/action-bar"
            target="_blank"
            rel="noreferrer"
          >
            Chakra Action Bar
          </a>
          <a
            href="https://www.radix-ui.com/primitives/docs/components/toolbar"
            target="_blank"
            rel="noreferrer"
          >
            Radix Toolbar
          </a>
          <a
            href="https://m3.material.io/components/bottom-app-bar/overview"
            target="_blank"
            rel="noreferrer"
          >
            Material bottom app bar
          </a>
        </div>
      </section>
    </>
  )
}
