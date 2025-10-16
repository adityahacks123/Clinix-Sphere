import React, { useState } from 'react';
import { doctors } from '../doctors';

const ClientDashboard = () => {
  const [appointments, setAppointments] = useState([]);

  const handleBookAppointment = (doctor) => {
    const newAppointment = {
      doctorName: doctor.name,
      specialty: doctor.specialty,
      status: 'Pending',
    };
    setAppointments([...appointments, newAppointment]);
  };

  const handleCancelAppointment = (index) => {
    setAppointments(appointments.filter((_, i) => i !== index));
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Client Dashboard</h1>
      
      <h2 className="section-title">Available Doctors</h2>
      <div className="doctors-grid">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="doctor-card">
            <h3>{doctor.name}</h3>
            <p>{doctor.specialty}</p>
            <button className="btn" onClick={() => handleBookAppointment(doctor)}>Book Appointment</button>
          </div>
        ))}
      </div>

      <h2 className="section-title">Your Appointments</h2>
      <div className="appointments-list">
        {appointments.length > 0 ? (
          <ul>
            {appointments.map((apt, index) => (
              <li key={index} className="appointment-card">
                <p><strong>Doctor:</strong> {apt.doctorName}</p>
                <p><strong>Specialty:</strong> {apt.specialty}</p>
                <p><strong>Status:</strong> <span className={`status-${apt.status.toLowerCase()}`}>{apt.status}</span></p>
                <button className="btn btn-danger" onClick={() => handleCancelAppointment(index)}>Cancel</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have no appointments.</p>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
