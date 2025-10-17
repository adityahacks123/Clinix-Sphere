import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState({
    symptoms: '',
    diagnosis: '',
    medicines: [{ name: '', dosage: '', duration: '' }],
    notes: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const config = {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      };
      try {
        const [userRes, aptRes] = await Promise.all([
          axios.get('/api/auth/me', config),
          axios.get('/api/appointments', config)
        ]);
        setAppointments(aptRes.data);
        socket.emit('join_room', userRes.data._id);
      } catch (err) {
        console.error(err.response ? err.response.data : err.message);
      }
    };

    fetchData();

    socket.on('new_appointment', (appointment) => {
      setAppointments((prevAppointments) => [...prevAppointments, appointment]);
    });

    return () => {
      socket.off('new_appointment');
    };
  }, []);

  const handleMarkAsCompleted = async (id) => {
    const config = {
      headers: {
        'x-auth-token': localStorage.getItem('token'),
      },
    };
    try {
      const res = await axios.put(`/api/appointments/${id}`, { status: 'Completed' }, config);
      setAppointments(appointments.map(apt => apt._id === id ? res.data : apt));
      setSelectedAppointment(id);
    } catch (err) {
      console.error(err.response.data);
    }
  };

  const onPrescriptionChange = (e) => setPrescriptionData({ ...prescriptionData, [e.target.name]: e.target.value });

  const onMedicineChange = (e, index) => {
    const newMedicines = [...prescriptionData.medicines];
    newMedicines[index][e.target.name] = e.target.value;
    setPrescriptionData({ ...prescriptionData, medicines: newMedicines });
  };

  const handlePrescriptionSubmit = async (e, appointmentId) => {
    e.preventDefault();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token'),
      },
    };
    try {
      await axios.post('/api/prescriptions', { ...prescriptionData, appointmentId }, config);
      setSelectedAppointment(null); // Hide form on success
    } catch (err) {
      console.error(err.response.data);
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
      <h1 className="dashboard-title">Doctor Dashboard</h1>
      <h2 className="section-title">Your Appointments</h2>
      <div className="appointments-list">
        {appointments.length > 0 ? (
          <ul>
            {appointments.map((apt) => (
              <li key={apt._id} className="appointment-card">
                <p><strong>Client:</strong> {apt.client.name}</p>
                <p><strong>Status:</strong> <span className={`status-${apt.status.toLowerCase()}`}>{apt.status}</span></p>
                {apt.status === 'Pending' && (
                  <button className="btn" onClick={() => handleMarkAsCompleted(apt._id)}>Mark as Completed</button>
                )}
                {selectedAppointment === apt._id && apt.status === 'Completed' && (
                  <form className="prescription-form" onSubmit={(e) => handlePrescriptionSubmit(e, apt._id)}>
                    <h3>Create Prescription</h3>
                    <input type="text" name="symptoms" placeholder="Symptoms" value={prescriptionData.symptoms} onChange={onPrescriptionChange} required />
                    <input type="text" name="diagnosis" placeholder="Diagnosis" value={prescriptionData.diagnosis} onChange={onPrescriptionChange} required />
                    <h4>Medicines</h4>
                    {prescriptionData.medicines.map((med, index) => (
                      <div key={index}>
                        <input type="text" name="name" placeholder="Name" value={med.name} onChange={(e) => onMedicineChange(e, index)} required />
                        <input type="text" name="dosage" placeholder="Dosage" value={med.dosage} onChange={(e) => onMedicineChange(e, index)} required />
                        <input type="text" name="duration" placeholder="Duration" value={med.duration} onChange={(e) => onMedicineChange(e, index)} required />
                      </div>
                    ))}
                    <textarea name="notes" placeholder="Additional Notes" value={prescriptionData.notes} onChange={onPrescriptionChange}></textarea>
                    <button type="submit" className="btn">Submit Prescription</button>
                  </form>
                )}
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

export default DoctorDashboard;
