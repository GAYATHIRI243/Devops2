import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import "./App.css";


const config = {
  Bus: { price: 350, layout: "sleeper" },
  Train: { price: 220, layout: "seat" },
  Flight: { price: 1800, layout: "seat" },
  Hotel: { price: 2500, layout: "room" },
};

const sleeperUpper = ["U1A","U1B","U2A","U2B","U3A","U3B","U4A","U4B"];
const sleeperLower = ["L1A","L1B","L2A","L2B","L3A","L3B","L4A","L4B"];

const seatRows = 6;
const seatCols = 4;

export default function App() {

  const [page, setPage] = useState("login");
  const [user, setUser] = useState("");

  const [service, setService] = useState("Bus");
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [selected, setSelected] = useState([]);

  const [history, setHistory] = useState([]);

  const cfg = config[service];
  const total = selected.length * cfg.price;


const resetForm = () => {
  setName("");
  setFrom("");
  setTo("");
  setDate("");
  setSelected([]);
};

  

  const loadHistory = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/bookings");
      const data = await res.json();
      setHistory(data);
    } catch (e) {
      console.log("history error", e);
    }
  };

  

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Travel Ticket", 20, 20);

      doc.setFontSize(12);
      doc.text(`User: ${user}`, 20, 40);
      doc.text(`Service: ${service}`, 20, 50);
      doc.text(`Passenger: ${name}`, 20, 60);

      if (service !== "Hotel") {
        doc.text(`From: ${from}`, 20, 70);
        doc.text(`To: ${to}`, 20, 80);
      }

      doc.text(`Date: ${date}`, 20, 90);
      doc.text(`Seats: ${selected.join(", ")}`, 20, 100);
      doc.text(`Amount: ₹${total}`, 20, 110);

      doc.save("ticket.pdf");
    } catch (e) {
      alert("PDF error");
      console.log(e);
    }
  };

  const saveBooking = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user,
          passengerName: name,
          type: service,
          selected: selected.join(","),
          from,
          to,
          date,
          amount: total
        })
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data);
        return false;
      }

      return true;

    } catch (e) {
      console.log("backend error", e);
      alert("Backend server not running");
      return false;
    }
  };

  

  if (page === "login") {
    return (
      <div className="page">
        <div className="card small">
          <h2>Login</h2>

          <input
            className="input"
            placeholder="Username"
            value={user}
            onChange={e => setUser(e.target.value)}
          />

          <button
            className="primary-btn"
            onClick={() => {
              if (!user) return alert("Enter username");
              setPage("select");
              loadHistory();
            }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  

  if (page === "select") {
    return (
      <div className="page">
        <div className="card">

          {/* Topbar */}
          <div className="topbar">
            <div>👤 {user}</div>
            <button className="logout" onClick={()=>setPage("login")}>
              Logout
            </button>
          </div>

          <h2>Travel Booking</h2>

          
    <div className="tabs">
  {Object.keys(config).map(s => (
    <button
      key={s}
      className={`tab-btn ${service===s?"active":""}`}
      onClick={()=>{
        setService(s);
        resetForm();
      }}
    >
      {s}
    </button>
  ))}
</div>


          
          <input className="input" placeholder="Passenger Name"
            value={name} onChange={e=>setName(e.target.value)} />

          {service !== "Hotel" && (
            <>
              <input className="input" placeholder="From"
                value={from} onChange={e=>setFrom(e.target.value)} />
              <input className="input" placeholder="To"
                value={to} onChange={e=>setTo(e.target.value)} />
            </>
          )}

          <input className="input" type="date"
            value={date} onChange={e=>setDate(e.target.value)} />

          

          <div className="seat-section">

            {cfg.layout === "sleeper" && (
              <>
                <h3>Upper</h3>
                <div className="sleeper-grid">
                  {sleeperUpper.map(id => (
                    <button key={id}
                      className={`seat sleeper ${selected.includes(id)?"selected":""}`}
                      onClick={()=>toggle(id)}>
                      {id}
                    </button>
                  ))}
                </div>

                <h3>Lower</h3>
                <div className="sleeper-grid">
                  {sleeperLower.map(id => (
                    <button key={id}
                      className={`seat sleeper ${selected.includes(id)?"selected":""}`}
                      onClick={()=>toggle(id)}>
                      {id}
                    </button>
                  ))}
                </div>
              </>
            )}

            {cfg.layout === "seat" && (
              <div className="seat-grid">
                {Array.from({length:seatRows}).map((_,r)=>(
                  <div key={r} className="seat-row">
                    {Array.from({length:seatCols}).map((_,c)=>{
                      const id=`${r+1}${String.fromCharCode(65+c)}`;
                      return (
                        <button key={id}
                          className={`seat ${selected.includes(id)?"selected":""}`}
                          onClick={()=>toggle(id)}>
                          {id}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

          </div>

          <div className="total">₹ {total}</div>

          <button
            className="primary-btn"
            disabled={!selected.length}
            onClick={()=>setPage("payment")}
          >
            Continue Payment
          </button>

        

          <h3>Booking History</h3>
          {history.map(b => (
            <div key={b.id} className="history-card">
              {b.passengerName} — {b.type} — {b.selected} — ₹{b.amount}
            </div>
          ))}

        </div>
      </div>
    );
  }



  if (page === "payment") {
    return (
      <div className="page">
        <div className="card small">
          <h2>UPI Payment</h2>
          <h3>₹ {total}</h3>

          <img
            className="qr"
            src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay"
          />

          <button
            className="primary-btn"
            onClick={async ()=>{
              const ok = await saveBooking();

              if (ok) {
                downloadPDF();
                await loadHistory();
                setPage("success");
              } else {
                alert("Save failed");
              }
            }}
          >
            Payment Done
          </button>
        </div>
      </div>
    );
  }



  if (page === "success") {
    return (
      <div className="page">
        <div className="card small">
          <h2>✅ Booking Success</h2>
          <button className="primary-btn"
            onClick={()=>setPage("select")}>
            Back
          </button>
        </div>
      </div>
    );
  }
}
