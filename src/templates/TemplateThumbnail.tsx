import { Hash, Layers, Package } from 'lucide-react'
import type { TemplateId } from './catalog'

function DashboardPreview() {
  return (
    <div className="thumbnail-dashboard">
      <div className="thumbnail-metrics">
        <div>
          <span>Open tasks</span>
          <strong>6</strong>
        </div>
        <div>
          <span>Completed</span>
          <strong>3</strong>
        </div>
      </div>
      <div className="thumbnail-chart">
        <p>Task throughput</p>
        <div>
          {[32, 48, 40, 64, 52, 78, 90, 75, 96].map((height, index) => (
            <i key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
function ProjectsPreview() {
  return (
    <div className="thumbnail-board">
      {[
        { title: 'To do', tasks: ['Review sign-in', 'Release notes'] },
        { title: 'In progress', tasks: ['API retries', 'Keyboard audit'] },
      ].map((column) => (
        <div key={column.title}>
          <p>{column.title}</p>
          {column.tasks.map((task) => (
            <div key={task}>
              {task}
              <span className="thumbnail-task-line" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
function SettingsPreview() {
  return (
    <div className="thumbnail-settings">
      <p>Workspace details</p>
      <div>
        <span>Workspace name</span>
        <span className="thumbnail-field">Northstar</span>
      </div>
      <div>
        <span>Email updates</span>
        <span className="thumbnail-switch">
          <i />
        </span>
      </div>
      <span className="thumbnail-save">Save changes</span>
    </div>
  )
}
function ChatPreview() {
  return (
    <div className="thumbnail-chat">
      <aside>
        {['general', 'design', 'engineering'].map((name) => (
          <span key={name}>
            <Hash size={14} />
            {name}
          </span>
        ))}
      </aside>
      <div>
        <strong>Jordan Chen</strong>
        <p>Morning, team. The review is ready.</p>
        <strong>Sam Lee</strong>
        <p>Keyboard checks are complete.</p>
        <span className="thumbnail-field">Message #general</span>
      </div>
    </div>
  )
}
function PeoplePreview() {
  return (
    <div className="thumbnail-business-list">
      <p>Employee directory</p>
      {[
        ['AM', 'Alex Morgan', 'Design'],
        ['SL', 'Sam Lee', 'Engineering'],
        ['NP', 'Nina Patel', 'People'],
      ].map(([initials, name, detail]) => (
        <div key={name}>
          <span className="thumbnail-avatar">{initials}</span>
          <span>
            {name}
            <small>{detail}</small>
          </span>
        </div>
      ))}
    </div>
  )
}
function LogisticsPreview({ pickup = false }: { pickup?: boolean }) {
  const rows = pickup
    ? [
        ['PKG-1045', 'Shelf A-01'],
        ['PKG-1046', 'Shelf B-02'],
      ]
    : [
        ['PKG-1042', 'Received'],
        ['PKG-1043', 'Sorted'],
      ]
  return (
    <div className="thumbnail-business-list">
      <p>{pickup ? 'Awaiting collection' : 'Sorting queue'}</p>
      <span className="thumbnail-scan">
        <Package size={15} />
        {pickup ? 'Find customer order' : 'Scan parcel barcode'}
      </span>
      {rows.map(([order, status]) => (
        <div className="thumbnail-order" key={order}>
          <span>{order}</span>
          <span>{status}</span>
        </div>
      ))}
    </div>
  )
}
function SupportPreview() {
  return (
    <div className="thumbnail-business-list">
      <p>Open conversations</p>
      {[
        ['Ava Bennett', 'Help with a delayed parcel'],
        ['Emma Wilson', 'Change my pickup location'],
      ].map(([name, subject]) => (
        <div className="thumbnail-ticket" key={name}>
          <strong>{name}</strong>
          <span>{subject}</span>
        </div>
      ))}
    </div>
  )
}
function BillingPreview() {
  return (
    <div className="thumbnail-business-list">
      <p>Invoices</p>
      {[
        ['Acme Studio', '$249.00'],
        ['Atlas Commerce', '$1,280.00'],
        ['Juniper Labs', '$499.00'],
      ].map(([name, amount]) => (
        <div className="thumbnail-order" key={name}>
          <span>{name}</span>
          <strong>{amount}</strong>
        </div>
      ))}
    </div>
  )
}
function BankingPreview() {
  return (
    <div className="thumbnail-bank-app">
      <div className="thumbnail-bank-card">
        <span>Meridian · Everyday</span>
        <i />
        <strong>•••• •••• 4821</strong>
      </div>
      <div className="thumbnail-bank-navigation">
        <span>Home</span>
        <span>Wallet</span>
        <span>Pay</span>
        <span>Cards</span>
      </div>
    </div>
  )
}
const previews = {
  banking: BankingPreview,
  dashboard: DashboardPreview,
  projects: ProjectsPreview,
  settings: SettingsPreview,
  chat: ChatPreview,
  hr: PeoplePreview,
  sorting: LogisticsPreview,
  pickup: () => <LogisticsPreview pickup />,
  support: SupportPreview,
  billing: BillingPreview,
}

export function TemplateThumbnail({ id }: { id: TemplateId }) {
  const Preview = previews[id]
  return (
    <div className="template-thumbnail" aria-hidden="true">
      <div className="thumbnail-nav">
        <span>
          <Layers size={16} /> {id.startsWith('banking') ? 'Meridian Bank' : 'Northstar'}
        </span>
        <span>{id === 'banking' ? 'Bank app' : 'Workspace'}</span>
      </div>
      <Preview />
    </div>
  )
}
