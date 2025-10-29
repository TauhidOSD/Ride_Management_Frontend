
import DriverIncomingRequests from '../components/DriverIncomingRequests'
import SummaryCards from '../components/SummaryCards'

export default function DriverDashboard() {
  return (
    <div className="p-4">
      <SummaryCards />
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2">
          {/* main driver workspace */}
          <h2 className="text-lg font-semibold mb-3">Active Area</h2>
          {/* other content */}
        </div>
        <div className="col-span-1">
          <DriverIncomingRequests />
        </div>
      </div>
    </div>
  )
}
