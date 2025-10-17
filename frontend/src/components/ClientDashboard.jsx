import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const socket = io('http://localhost:3001');

const ClientDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const config = {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      };
      try {
        const [docRes, aptRes, prescRes] = await Promise.all([
          axios.get('/api/doctors'),
          axios.get('/api/appointments', config),
          axios.get('/api/prescriptions', config)
        ]);
        setDoctors(docRes.data);
        setAppointments(aptRes.data);
        setPrescriptions(prescRes.data);
      } catch (err) {
        console.error(err.response ? err.response.data : err.message);
      }
    };

    fetchData();

    socket.on('doctor_online', (doctor) => {
      setDoctors((prevDoctors) => {
        if (!prevDoctors.find(d => d._id === doctor._id)) {
          return [...prevDoctors, doctor];
        }
        return prevDoctors;
      });
    });

    socket.on('doctor_offline', (doctorId) => {
      setDoctors((prevDoctors) => prevDoctors.filter(doc => doc._id !== doctorId));
    });

    return () => {
      socket.off('doctor_online');
      socket.off('doctor_offline');
    };
  }, []);

  const handleBookAppointment = async (doctor) => {
    console.log('Booking appointment for doctor:', doctor);
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
    };
    try {
      console.log('Sending request with doctorId:', doctor._id);
      const res = await axios.post('/api/appointments', { doctorId: doctor._id }, config);
      console.log('Appointment created:', res.data);
      setAppointments([...appointments, res.data]);
      alert('Appointment booked successfully!');
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      alert('Failed to book appointment. Check console for details.');
    }
  };

  const handleLogout = async () => {
    const config = {
      headers: {
        'x-auth-token': localStorage.getItem('token'),
      },
    };
    try {
      await axios.post('/api/auth/logout', {}, config);
      localStorage.removeItem('token');
      navigate('/');
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <div className="dashboard-container">
      <button className="btn btn-danger" onClick={handleLogout} style={{ float: 'right' }}>Logout</button>
      <h1 className="dashboard-title">Client Dashboard</h1>
      
      <h2 className="section-title">Available Doctors</h2>
      <div className="doctors-grid">
        {doctors.map((doctor) => (
          <div key={doctor._id} className="doctor-card">
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
            {appointments.map((apt) => (
              <li key={apt._id} className="appointment-card">
                <p><strong>Doctor:</strong> {apt.doctorName}</p>
                <p><strong>Specialty:</strong> {apt.specialty}</p>
                <p><strong>Status:</strong> <span className={`status-${apt.status.toLowerCase()}`}>{apt.status}</span></p>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have no appointments.</p>
        )}
      </div>

      <h2 className="section-title">Your Prescriptions</h2>
      <div className="appointments-list">
        {prescriptions.length > 0 ? (
          <ul>
            {prescriptions.map((presc) => (
              <li key={presc._id} className="appointment-card">
                <p><strong>Doctor:</strong> {presc.doctor.name}</p>
                <p><strong>Symptoms:</strong> {presc.symptoms}</p>
                <p><strong>Diagnosis:</strong> {presc.diagnosis}</p>
                <h4>Medicines</h4>
                <ul>
                  {presc.medicines.map((med, index) => (
                    <li key={index}>{med.name} ({med.dosage}, {med.duration})</li>
                  ))}
                </ul>
                {presc.notes && <p><strong>Notes:</strong> {presc.notes}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p>You have no prescriptions.</p>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;