
import RiderActiveRide from "../../components/RiderActiveRide"

export default function RiderDashboardPage() {
  
  const ride = {
    _id: 'replace_with_real_ride_id',
    status: 'requested'
  }

  return (
    <div className='p-6'>
      <h1 className='text-xl font-bold mb-4'>Rider Dashboard</h1>
      <RiderActiveRide ride={ride} />
    </div>
  )
}
