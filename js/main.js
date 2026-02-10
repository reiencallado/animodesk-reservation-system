let currentUser = null;

function validatePasswordRequirements() {
    const password = document.getElementById('reg-pass').value.trim();
    const note = document.getElementById('password-note');
    const confirmGroup = document.getElementById('confirm-pass-group');
    
    let hasLength = password.length >= 8;
    let hasLetter = /[a-zA-Z]/.test(password);
    let hasNumber = /[0-9]/.test(password);
    let isValid = hasLength && hasLetter && hasNumber;
    
    if(password.length === 0) {
        note.classList.remove('text-danger');
        note.classList.add('text-muted');
        confirmGroup.classList.add('hidden');
    } else if(isValid) {
        note.classList.remove('text-danger');
        note.classList.add('text-muted');
        confirmGroup.classList.remove('hidden');
    } else {
        note.classList.remove('text-muted');
        note.classList.add('text-danger');
        confirmGroup.classList.add('hidden');
    }
}

function nav(id) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    if(id === 'directory') renderDirectory();
    if(id === 'tech-dashboard') renderTechDashboard();
    if(id === 'my-profile') renderMyReservations();
}

function doLogin() {
    const email = document.getElementById('login-email').value;
    currentUser = users.find(u => u.email === email) || users[0];
    document.getElementById('auth-overlay').classList.add('hidden');
    document.getElementById('app-body').classList.remove('hidden');
    if(currentUser.role === 'technician') document.getElementById('tech-nav').classList.remove('hidden');
    
    document.getElementById('my-name').innerText = currentUser.name;
    document.getElementById('my-pic').src = currentUser.img;
    document.getElementById('my-role-text').innerText = currentUser.role.toUpperCase();
    document.getElementById('my-bio').innerText = currentUser.bio;
    nav('view-slots');
}

function doRegister() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-pass').value.trim();
    const passwordConfirm = document.getElementById('reg-pass-confirm').value.trim();
    const role = document.getElementById('reg-role').value;
    
    // Validate DLSU email
    if(!email.endsWith('@dlsu.edu.ph')) {
        alert("Please use a valid DLSU email!");
        return;
    }
    
    // Check if email already exists
    if(users.find(u => u.email === email)) {
        alert("This email is already registered!");
        return;
    }
    
    // Validate fields
    if(!name || !password || !passwordConfirm) {
        alert("All fields are required!");
        return;
    }
    
    // Validate password length
    if(password.length < 8) {
        alert("Password must be at least 8 characters long!");
        return;
    }
    
    // Validate password has at least one letter
    if(!/[a-zA-Z]/.test(password)) {
        alert("Password must include at least one letter!");
        return;
    }
    
    // Validate password has at least one number
    if(!/[0-9]/.test(password)) {
        alert("Password must include at least one number!");
        return;
    }
    
    // Validate passwords match
    if(password !== passwordConfirm) {
        alert("Passwords do not match!");
        return;
    }
    
    // Create new user
    const newUser = {
        id: "NEW" + Date.now(),
        name: name,
        email: email,
        role: role,
        bio: role === 'technician' ? 'Lab Support Staff' : 'Student',
        img: `https://i.pravatar.cc/150?u=${email}`
    };
    
    // Add to users array
    users.push(newUser);
    currentUser = newUser;
    
    // Log in the new user
    document.getElementById('auth-overlay').classList.add('hidden');
    document.getElementById('app-body').classList.remove('hidden');
    if(currentUser.role === 'technician') document.getElementById('tech-nav').classList.remove('hidden');
    
    document.getElementById('my-name').innerText = currentUser.name;
    document.getElementById('my-pic').src = currentUser.img;
    document.getElementById('my-role-text').innerText = currentUser.role.toUpperCase();
    document.getElementById('my-bio').innerText = currentUser.bio;
    nav('view-slots');
    
    alert("Account created successfully!");
}

function renderMyReservations() {
    const tbody = document.getElementById('my-res-rows');
    tbody.innerHTML = '';
    reservations.filter(r => r.userId === currentUser.id).forEach(r => {
        tbody.innerHTML += `<tr><td>${r.date} (${r.slots[0]})</td><td>${r.lab}</td><td>${r.seat}</td><td><button class="btn btn-sm btn-danger" onclick="alert('Cancelled')">Cancel</button></td></tr>`;
    });
}

function renderDirectory() {
    const grid = document.getElementById('user-grid');
    grid.innerHTML = '';
    users.forEach(u => {
        grid.innerHTML += `<div class="col-md-4 mb-3"><div class="card p-3 text-center"><img src="${u.img}" class="rounded-circle mx-auto mb-2" width="60"><h6>${u.name}</h6><button class="btn btn-sm btn-outline-success" onclick="viewPublicProfile('${u.id}')">View Profile</button></div></div>`;
    });
}

function viewPublicProfile(id) {
    const u = users.find(user => user.id === id);
    document.getElementById('modal-img').src = u.img;
    document.getElementById('modal-name').innerText = u.name;
    document.getElementById('modal-bio').innerText = u.bio;
    new bootstrap.Modal(document.getElementById('profileModal')).show();
}

function renderTechDashboard() {
    const tbody = document.getElementById('all-res-rows');
    tbody.innerHTML = '';
    reservations.forEach(r => {
        tbody.innerHTML += `<tr><td>${r.date} (${r.slots[0]})</td><td>${r.lab}</td><td>${r.seat}</td><td>${r.userName}</td><td>${r.anon ? 'Anonymous' : 'Public'}</td><td><button class="btn btn-sm btn-warning" onclick="alert('Blocked')">Block Slot</button></td></tr>`;
    });
}

function handleLogout() { location.reload(); }
function toggleAuth(isReg) { 
    document.getElementById('login-form').classList.toggle('hidden', isReg); 
    document.getElementById('register-form').classList.toggle('hidden', !isReg); 
}

window.onload = initTimeSelect;