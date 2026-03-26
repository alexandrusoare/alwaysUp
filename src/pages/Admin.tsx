import { useState } from 'react'
import { AdminImport } from '../components/AdminImport'
import { AdminActionList } from '../components/AdminActionList'

type TabType = 'import' | 'edit'

export function Admin() {
  const [activeTab, setActiveTab] = useState<TabType>('edit')

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Admin Panel</h1>
      </div>

      <div className="admin-tabs">
        <button
          type="button"
          className={`admin-tab ${activeTab === 'edit' ? 'active' : ''}`}
          onClick={() => setActiveTab('edit')}
        >
          Edit Actions
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          Import JSON
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'edit' && <AdminActionList />}
        {activeTab === 'import' && <AdminImport />}
      </div>
    </div>
  )
}
