function initTimeSelect() {
    const sel = document.getElementById('res-times');
    for(let h=7; h<19; h++) {
        ['00', '30'].forEach(m => {
            let t = `${h.toString().padStart(2, '0')}:${m}`;
            sel.innerHTML += `<option value="${t}">${t}</option>`;
        });
    }
    document.getElementById('res-date').valueAsDate = new Date();
}

function renderMap() {
    const lab = document.getElementById('lab-choice').value;
    const date = document.getElementById('res-date').value;
    const grid = document.getElementById('lab-map');
    document.getElementById('map-area').classList.remove('hidden');
    grid.innerHTML = '';

    let availableCount = 0;
    let occupiedCount = 0;

    for(let i=1; i<=40; i++) {
        const seatId = `PC-${i.toString().padStart(2, '0')}`;
        const res = reservations.find(r => r.lab.includes(lab.substring(0,2)) && r.date === date && r.seat === seatId);
        
        const btn = document.createElement('div');
        btn.className = `seat ${res ? 'occupied' : 'available'}`;
        btn.innerHTML = `<i class="fas fa-desktop mb-1"></i>${i}`;
        
        if(!res) {
            availableCount++;
            btn.onclick = () => {
                document.querySelectorAll('.seat').forEach(s => s.classList.remove('selected'));
                btn.classList.add('selected');
                btn.dataset.seat = seatId;
            };
        } else {
            occupiedCount++;
            btn.onclick = () => { if(!res.anon) viewPublicProfile(res.userId); };
        }
        grid.appendChild(btn);
    }

    // Update map title with availability info
    document.getElementById('map-title').innerText = `Layout - ${availableCount} Available, ${occupiedCount} Occupied`;
    
    // Show available slots info
    const selectedSlots = Array.from(document.getElementById('res-times').selectedOptions).map(o => o.value);
    if(selectedSlots.length > 0) {
        const slotStr = selectedSlots.join(', ');
        document.getElementById('slot-info').innerHTML = `Showing availability for: <strong>${slotStr}</strong>`;
    } else {
        document.getElementById('slot-info').innerText = 'Select time slots to filter availability';
    }
}

function getAvailableSlots(lab, date) {
    const availableSlots = [];
    for(let h=7; h<19; h++) {
        ['00', '30'].forEach(m => {
            let t = `${h.toString().padStart(2, '0')}:${m}`;
            // Check if any seat is available at this time
            let hasAvailable = false;
            for(let i=1; i<=40; i++) {
                const seatId = `PC-${i.toString().padStart(2, '0')}`;
                const res = reservations.find(r => r.lab.includes(lab.substring(0,2)) && r.date === date && r.seat === seatId && r.slots.includes(t));
                if(!res) {
                    hasAvailable = true;
                    break;
                }
            }
            if(hasAvailable) {
                availableSlots.push(t);
            }
        });
    }
    return availableSlots;
}

function submitReservation() {
    const selected = document.querySelector('.seat.selected');
    const slots = Array.from(document.getElementById('res-times').selectedOptions).map(o => o.value);
    if(!selected || slots.length === 0) return alert("Select seat and time slots!");

    const lab = document.getElementById('lab-choice').value;
    const date = document.getElementById('res-date').value;
    
    // Validate that selected slots are actually available for this seat
    for(let slot of slots) {
        const conflictRes = reservations.find(r => 
            r.lab.includes(lab.substring(0,2)) && 
            r.date === date && 
            r.seat === selected.dataset.seat && 
            r.slots.includes(slot)
        );
        if(conflictRes) {
            alert(`Seat ${selected.dataset.seat} is already reserved for ${slot}. Please select different slots.`);
            return;
        }
    }

    reservations.push({
        id: Date.now(), userId: currentUser.id, userName: currentUser.name,
        lab: lab, date: date,
        slots: slots, seat: selected.dataset.seat, anon: document.getElementById('anon-res').checked
    });
    alert("Reservation Confirmed!");
    nav('my-profile');
}