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
    const found = users.find(u => u.email === email);
    if(!found) {
        alert('No user found with that email. Please register or check your email.');
        return;
    }
    currentUser = found;
    
    // Handle "Remember me" checkbox
    const rememberMe = document.getElementById('remember-me').checked;
    if(rememberMe) {
        setRememberMe(currentUser.email);
    }
    
    loginUser(currentUser);
}

function setRememberMe(email) {
    const expirationTime = Date.now() + (3 * 7 * 24 * 60 * 60 * 1000); // 3 weeks in milliseconds
    localStorage.setItem('rememberMe', JSON.stringify({
        email: email,
        expiration: expirationTime
    }));
}

function getRememberedUser() {
    const raw = localStorage.getItem('rememberMe');
    if(!raw) return null;
    let remembered = null;
    try {
        remembered = JSON.parse(raw);
    } catch (e) {
        localStorage.removeItem('rememberMe');
        return null;
    }
    
    // Check if remember me has expired
    if(Date.now() > remembered.expiration) {
        localStorage.removeItem('rememberMe');
        return null;
    }
    
    // Extend the remember me period by 3 weeks on each visit
    setRememberMe(remembered.email);
    return remembered.email;
}

function loginUser(user) {
    currentUser = user;
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
        password: password,
        role: role,
        bio: role === 'technician' ? 'Lab Support Staff' : 'Student',
        img: `https://i.pravatar.cc/150?u=${email}`
    };
    
    // Add to users array
    users.push(newUser);
    
    // Log in the new user
    loginUser(newUser);
    
    alert("Account created successfully!");
}

function toggleEditProfile() {
    const editFields = document.getElementById('edit-profile-fields');
    const btnEdit = document.getElementById('btn-edit-toggle');
    const isEditing = !editFields.classList.contains('hidden');
    
    if(isEditing) {
        // Cancel editing
        editFields.classList.add('hidden');
        btnEdit.innerText = 'Edit Profile';
        btnEdit.classList.remove('btn-success');
        btnEdit.classList.add('btn-outline-success');
    } else {
        // Enter edit mode
        document.getElementById('edit-name').value = currentUser.name;
        document.getElementById('edit-bio').value = currentUser.bio;
        editFields.classList.remove('hidden');
        btnEdit.innerText = 'Save Changes';
        btnEdit.classList.remove('btn-outline-success');
        btnEdit.classList.add('btn-success');
    }
}

function handleProfileButtonClick() {
    const btnEdit = document.getElementById('btn-edit-toggle');
    if(btnEdit.innerText === 'Edit Profile') {
        toggleEditProfile();
    } else {
        saveProfileChanges();
    }
}

function saveProfileChanges() {
    const newName = document.getElementById('edit-name').value.trim();
    const newBio = document.getElementById('edit-bio').value.trim();
    
    if(!newName) {
        alert("Name cannot be empty!");
        return;
    }
    
    // Update current user object
    currentUser.name = newName;
    currentUser.bio = newBio;
    
    // Update user in users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if(userIndex !== -1) {
        users[userIndex].name = newName;
        users[userIndex].bio = newBio;
    }
    
    // Update display
    document.getElementById('my-name').innerText = currentUser.name;
    document.getElementById('my-bio').innerText = currentUser.bio;
    // Update other views that list user info
    renderDirectory();
    renderMyReservations();
    
    // Exit edit mode
    document.getElementById('edit-profile-fields').classList.add('hidden');
    document.getElementById('btn-edit-toggle').innerText = 'Edit Profile';
    document.getElementById('btn-edit-toggle').classList.remove('btn-success');
    document.getElementById('btn-edit-toggle').classList.add('btn-outline-success');
    
    alert("Profile updated successfully!");
}

function handleProfilePictureUpload(event) {
    const file = event.target.files[0];
    if(!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const imageData = e.target.result;
        currentUser.img = imageData;
        
        // Update user in users array
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if(userIndex !== -1) {
            users[userIndex].img = imageData;
        }
        
        // Update display
        document.getElementById('my-pic').src = imageData;
        renderDirectory();
        alert("Profile picture updated!");
    };
    reader.readAsDataURL(file);
}

function handlePicKeydown(e) {
    // Allow Enter or Space to trigger the file input when overlay is focused
    if(e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        document.getElementById('pic-upload').click();
    }
}

function handleDeleteAccount() {
    const confirmDelete = confirm("Are you sure you want to delete your account? This action cannot be undone and all your reservations will be cancelled.");
    if(!confirmDelete) return;
    
    const finalConfirm = prompt("Type your name to confirm deletion: " + currentUser.name);
    if(finalConfirm !== currentUser.name) {
        alert("Confirmation failed. Account not deleted.");
        return;
    }
    
    // Remove user from users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if(userIndex !== -1) {
        users.splice(userIndex, 1);
    }
    
    // Cancel all user's reservations
    reservations = reservations.filter(r => r.userId !== currentUser.id);
    
    // Clear remember me data if exists
    localStorage.removeItem('rememberMe');
    
    alert("Your account has been deleted successfully.");
    handleLogout();
}

function renderMyReservations() {
    const tbody = document.getElementById('my-res-rows');
    tbody.innerHTML = '';
    const myReservations = reservations.filter(r => r.userId === currentUser.id);
    
    if(myReservations.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No reservations yet</td></tr>`;
    } else {
        myReservations.forEach(r => {
            tbody.innerHTML += `<tr><td>${r.date} (${r.slots[0]})</td><td>${r.lab}</td><td>${r.seat}</td><td><button class="btn btn-sm btn-danger" onclick="cancelReservation(${r.id})">Cancel</button></td></tr>`;
        });
    }
}

function cancelReservation(reservationId) {
    if(confirm("Are you sure you want to cancel this reservation?")) {
        const index = reservations.findIndex(r => r.id === reservationId);
        if(index !== -1) {
            reservations.splice(index, 1);
            renderMyReservations();
            alert("Reservation cancelled!");
        }
    }
}

function renderDirectory() {
    const grid = document.getElementById('user-grid');
    grid.innerHTML = '';
    users.forEach(u => {
        grid.innerHTML += `<div class="col-md-4 mb-3"><div class="card p-3 text-center"><img src="${u.img}" class="rounded-circle mx-auto mb-2" width="60"><h6>${u.name}</h6><button class="btn btn-sm btn-outline-success" onclick="viewPublicProfile('${u.id}')">View Profile</button></div></div>`;
    });
}

function searchUsers() {
    const searchQuery = document.getElementById('user-search').value.toLowerCase();
    const grid = document.getElementById('user-grid');
    grid.innerHTML = '';
    
    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchQuery) || 
        u.email.toLowerCase().includes(searchQuery)
    );
    
    if(filteredUsers.length === 0) {
        grid.innerHTML = `<div class="col-12"><p class="text-center text-muted">No users found</p></div>`;
    } else {
        filteredUsers.forEach(u => {
            grid.innerHTML += `<div class="col-md-4 mb-3"><div class="card p-3 text-center"><img src="${u.img}" class="rounded-circle mx-auto mb-2" width="60"><h6>${u.name}</h6><button class="btn btn-sm btn-outline-success" onclick="viewPublicProfile('${u.id}')">View Profile</button></div></div>`;
        });
    }
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

function handleLogout() { 
    localStorage.removeItem('rememberMe');
    location.reload(); 
}
function toggleAuth(isReg) { 
    document.getElementById('login-form').classList.toggle('hidden', isReg); 
    document.getElementById('register-form').classList.toggle('hidden', !isReg); 
}

function initApp() {
    initTimeSelect();
    
    // Check if user is remembered
    const rememberedEmail = getRememberedUser();
    if(rememberedEmail) {
        const user = users.find(u => u.email === rememberedEmail);
        if(user) {
            loginUser(user);
        }
    }
}

window.onload = initApp;