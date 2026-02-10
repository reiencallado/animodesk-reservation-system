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

    for(let i=1; i<=40; i++) {
        const seatId = `PC-${i.toString().padStart(2, '0')}`;
        const res = reservations.find(r => r.lab.includes(lab.substring(0,2)) && r.date === date && r.seat === seatId);
        
        const btn = document.createElement('div');
        btn.className = `seat ${res ? 'occupied' : 'available'}`;
        btn.innerHTML = `<i class="fas fa-desktop mb-1"></i>${i}`;
        
        if(!res) {
            btn.onclick = () => {
                document.querySelectorAll('.seat').forEach(s => s.classList.remove('selected'));
                btn.classList.add('selected');
                btn.dataset.seat = seatId;
            };
        } else {
            btn.onclick = () => { if(!res.anon) viewPublicProfile(res.userId); };
        }
        grid.appendChild(btn);
    }
}

function submitReservation() {
    const selected = document.querySelector('.seat.selected');
    const slots = Array.from(document.getElementById('res-times').selectedOptions).map(o => o.value);
    if(!selected || slots.length === 0) return alert("Select seat and time slots!");

    reservations.push({
        id: Date.now(), userId: currentUser.id, userName: currentUser.name,
        lab: document.getElementById('lab-choice').value, date: document.getElementById('res-date').value,
        slots: slots, seat: selected.dataset.seat, anon: document.getElementById('anon-res').checked
    });
    alert("Reservation Confirmed!");
    nav('my-profile');
}