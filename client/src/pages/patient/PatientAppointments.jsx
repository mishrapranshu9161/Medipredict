import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { appointmentAPI, doctorAPI, departmentAPI } from '../../services/api';
import { Calendar as CalendarIcon, Clock, Plus, Search, Filter, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { LoadingBlock } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';

export const PatientAppointments = () => {
  const [searchParams] = useSearchParams();
  const initialDoctorId = searchParams.get('doctorId') || '';

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(!!initialDoctorId);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(initialDoctorId);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [reason, setReason] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const availableSlotsList = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];

  const fetchAppointments = () => {
    setLoading(true);
    appointmentAPI.getAppointments()
      .then(res => res.success && setAppointments(res.data.appointments))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
    departmentAPI.getDepartments().then(res => res.success && setDepartments(res.data.departments)).catch(() => {});
    doctorAPI.getDoctors().then(res => res.success && setDoctors(res.data.doctors)).catch(() => {});
  }, []);

  // Fetch booked slots whenever selected doctor or date changes (DOUBLE BOOKING PREVENTION VISUALIZER)
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      appointmentAPI.getBookedSlots(selectedDoctor, selectedDate)
        .then(res => res.success && setBookedSlots(res.data.bookedSlots))
        .catch(() => setBookedSlots([]));
    }
  }, [selectedDoctor, selectedDate]);

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');

    if (!selectedDoctor || !selectedDate || !selectedSlot || !reason) {
      setBookingError('Please fill all fields: doctor, date, slot, and reason');
      return;
    }

    const docObj = doctors.find(d => d._id === selectedDoctor);
    if (!docObj) {
      setBookingError('Invalid doctor selection');
      return;
    }

    setSubmitting(true);
    try {
      const res = await appointmentAPI.bookAppointment({
        doctorId: selectedDoctor,
        departmentId: docObj.department?._id || departments[0]?._id,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        reason
      });

      if (res.success) {
        setBookingSuccess('Appointment booked successfully!');
        fetchAppointments();
        setTimeout(() => {
          setIsModalOpen(false);
          setBookingSuccess('');
          setReason('');
          setSelectedSlot('');
        }, 1500);
      }
    } catch (err) {
      setBookingError(err.message || 'Double booking error: slot unavailable.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentAPI.updateStatus(id, { status: 'Cancelled', cancellationReason: 'Cancelled by patient' });
        fetchAppointments();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const filteredDoctors = selectedDept
    ? doctors.filter(d => d.department?._id === selectedDept)
    : doctors;

  return (
    <div className="space-y-8">
      
      {/* Header & New Booking Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Appointments</h1>
          <p className="text-xs text-slate-500 mt-1">Schedule consultations and track status with instant slot availability check.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {/* Appointment History List */}
      {loading ? (
        <LoadingBlock message="Fetching appointments..." />
      ) : appointments.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Doctor</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Date & Slot</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {appointments.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      Dr. {a.doctor?.user?.name || 'Specialist'}
                    </td>
                    <td className="py-3.5 px-4">{a.department?.name || 'General'}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900">{a.appointmentDate}</span>
                      <span className="text-slate-400 block text-[11px]">{a.timeSlot}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate">{a.reason}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {['Pending', 'Confirmed'].includes(a.status) && (
                        <button
                          onClick={() => handleCancel(a._id)}
                          className="text-rose-600 hover:text-rose-800 font-bold hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No appointments scheduled"
          description="Click 'Book New Appointment' to select a doctor and available time slot."
        />
      )}

      {/* Booking Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Book Doctor Appointment">
        {bookingError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{bookingError}</span>
          </div>
        )}

        {bookingSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{bookingSuccess}</span>
          </div>
        )}

        <form onSubmit={handleBook} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-slate-700 mb-1">Filter by Department</label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedDoctor('');
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Doctor *</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              <option value="">-- Choose Doctor --</option>
              {filteredDoctors.map(d => (
                <option key={d._id} value={d._id}>
                  {d.user?.name} — {d.specialization} (Fee: ₹{d.consultationFee})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Appointment Date *</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Double Booking Status</label>
              <div className="p-2 bg-slate-100 rounded-xl text-[11px] text-slate-600 font-semibold">
                {bookedSlots.length > 0 ? (
                  <span className="text-amber-700">{bookedSlots.length} slot(s) already booked</span>
                ) : (
                  <span className="text-emerald-700">All slots available for booking</span>
                )}
              </div>
            </div>
          </div>

          {/* Time Slot Buttons */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Select Time Slot *</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableSlotsList.map((slot) => {
                const isBooked = bookedSlots.includes(slot);
                const isSelected = selectedSlot === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isBooked}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                      isBooked
                        ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through'
                        : isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason for Visit *</label>
            <textarea
              required
              rows="3"
              placeholder="Describe your symptoms or reason for booking..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedSlot}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {submitting ? 'Confirming...' : 'Confirm Appointment'}
            </button>
          </div>

        </form>
      </Modal>
    </div>
  );
};
