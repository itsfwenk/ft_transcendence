import { UserData, fetchUserProfile, getAvatarUrl, updateProfileBoxUI } from './profile';
import i18n from '../i18n';

function showNotification(message: string, isSuccess: boolean, duration: number = 3000) {
  let notificationElement = document.getElementById('notification');
  
  if (!notificationElement) {
    notificationElement = document.createElement('div');
    notificationElement.id = 'notification';
    notificationElement.className = 'fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg z-20 flex items-center';
    document.body.appendChild(notificationElement);
  }
  
  notificationElement.className = isSuccess 
    ? 'fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg z-20 flex items-center bg-green-500 text-white'
    : 'fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg z-20 flex items-center bg-red-500 text-white';
  
  const iconSvg = isSuccess
    ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
       </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
       </svg>`;
  
  const messageSpan = document.createElement('span');
  messageSpan.textContent = message;
  
  notificationElement.innerHTML = iconSvg;
  notificationElement.appendChild(messageSpan);
  
  notificationElement.classList.remove('hidden');
  
  setTimeout(() => {
    if (notificationElement) {
      notificationElement.classList.add('hidden');
      setTimeout(() => {
        notificationElement?.remove();
      }, 300);
    }
  }, duration);
}

function showError(message: string, duration: number = 5000) {
  showNotification(message, false, duration);
}
  
function hideError() {
  const errorElement = document.getElementById('errorMessage');
  if (errorElement) {
    errorElement.classList.add('hidden');
  }
  
  const notificationElement = document.getElementById('notification');
  if (notificationElement) {
    notificationElement.classList.add('hidden');
  }
}

async function checkGoogleAuthentication(): Promise<boolean> {
  try {
    const baseUrl = window.location.origin;
    const response = await fetch(`${baseUrl}/user/auth/status`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Error fetching auth status:', response.statusText);
      return false;
    }

    const data = await response.json();
    console.log('Google authentication status:', data);
    
    return data.user?.hasGoogleLinked || false;
  } catch (error) {
    console.error('Error checking Google authentication:', error);
    return false;
  }
}

export default function EditProfile() {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = /*html*/`
    <div class="text-black font-jaro text-9xl mt-16 mb-20 select-none">${i18n.t('general.pongGame')}</div>
    <div>
      <div id="twoBox" class="flex justify-center items-center mb-10 gap-5">
        <div id="profilBox" class="h-80 w-1/3 bg-blue-700 rounded-lg p-4 text-white">
          <div id="img_name" class="flex items-center mb-4">
            <div id="img" class="w-28 h-28 rounded-lg bg-gray-300 mr-4 overflow-hidden relative group cursor-pointer">
              <img id="profileImage" src="/avatars/default.png" alt="Profile" class="w-full h-full object-cover select-none"/>
              <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input type="file" id="avatarUpload" class="hidden" accept="image/*" />
            </div>
            <div class="flex flex-col">
              <div id="usernameContainer" class="flex items-center">
                <div id="username" class="flex justify-center items-center text-xl font-bold font-jaro bg-white text-black rounded-lg pl-2 pr-2 pb-0.5 select-none">${i18n.t('general.loading')}</div>
                <button id="editUsernameBtn" class="ml-2 text-white hover:text-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
              <div id="usernameEditContainer" class="hidden flex items-center mt-1">
                <input type="text" id="usernameInput" maxlength="7" class="bg-white text-black rounded-md w-1/2 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="${i18n.t('editProfile.maxCharsUsername')}" />
                <button id="saveUsernameBtn" class="ml-1 bg-green-500 hover:bg-green-600 text-white rounded-md px-2 py-1 text-sm">✓</button>
                <button id="cancelUsernameBtn" class="ml-1 bg-red-500 hover:bg-red-600 text-white rounded-md px-2 py-1 text-sm">✗</button>
              </div>
            </div>
          </div>
          
          <div id="emailContainer" class="flex items-center mb-3">
            <div id="email" class="flex font-jaro select-none">${i18n.t('general.loading')}</div>
            <button id="editEmailBtn" class="ml-2 text-white hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
          <div id="emailEditContainer" class="hidden flex items-center mb-3">
            <input type="email" id="emailInput" class="bg-white text-black rounded-md px-2 py-1 text-sm w-full mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="${i18n.t('editProfile.newEmail')}" />
            <button id="saveEmailBtn" class="ml-1 bg-green-500 hover:bg-green-600 text-white rounded-md px-2 py-1 text-sm">✓</button>
            <button id="cancelEmailBtn" class="ml-1 bg-red-500 hover:bg-red-600 text-white rounded-md px-2 py-1 text-sm">✗</button>
          </div>
          
          <div id="totalGames" class="flex mb-2">
            <div class="font-jaro text-2xl select-none">${i18n.t('profile.totalGames')}: </div>
            <div id="nbGames" class="ml-2 pt-0.5 font-jaro text-xl">0</div>
          </div>
          <div id="stats" class="flex justify-around items-center mt-3 text-center">
            <div id="win" class="flex flex-col items-center gap-4">
              <div class="font-bold font-jaro text-2xl select-none">${i18n.t('profile.win')}</div>
              <div id="statWin" class="text-xl font-jaro select-none">0</div>
            </div>
            <div id="losses" class="flex flex-col items-center gap-4">
              <div class="font-bold font-jaro text-2xl select-none">${i18n.t('profile.losses')}</div>
              <div id="statLosses" class="text-xl font-jaro select-none">0</div>
            </div>
            <div id="winrate" class="flex flex-col items-center gap-4">
              <div class="font-bold font-jaro text-2xl select-none">${i18n.t('profile.winRate')}</div>
              <div id="statWinRate" class="text-xl font-jaro select-none">0%</div>
            </div>
          </div>
        </div>
      </div>
      
      <div id="passwordChangeContainer" class="hidden fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-white rounded-lg p-6 shadow-xl w-96 text-black">
          <h3 class="text-xl font-bold mb-4 font-jaro">${i18n.t('editProfile.changePassword')}</h3>
          
          <div class="mb-4">
            <label for="oldPassword" class="block text-sm font-medium text-gray-700 mb-1">${i18n.t('editProfile.currentPassword')}</label>
            <input type="password" id="oldPassword" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="${i18n.t('editProfile.enterCurrentPassword')}" />
          </div>
          
          <div class="mb-4">
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">${i18n.t('editProfile.newPassword')}</label>
            <input type="password" id="newPassword" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="${i18n.t('editProfile.enterNewPassword')}" />
            <p class="text-xs text-gray-500 mt-1">${i18n.t('editProfile.passwordRequirement')}</p>
          </div>
          
          <div class="mb-4">
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">${i18n.t('editProfile.confirmPassword')}</label>
            <input type="password" id="confirmPassword" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="${i18n.t('editProfile.confirmNewPassword')}" />
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button id="cancelPasswordChange" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none">
              ${i18n.t('general.cancel')}
            </button>
            <button id="savePasswordChange" class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none">
              ${i18n.t('general.save')}
            </button>
          </div>
        </div>
      </div>
      
      <div class="flex justify-center items-center gap-9">
        <div id="saveChangesBtn" class='button mb-2 h-20 w-1/6 bg-green-600 rounded-lg cursor-pointer select-none
        hover:translate-y-2 hover:[box-shadow:0_0px_0_0_#15803d,0_0px_0_0_#1b70f841]
        hover:border-b-[0px]
        transition-all duration-150 [box-shadow:0_10px_0_0_#15803d,0_15px_0_0_#1b70f841]
        border-b-[1px] border-green-400'>
        <span class='flex flex-col justify-center items-center h-full text-white font-jaro text-2xl'>${i18n.t('editProfile.saveChanges')}</span>
        </div>

        <div id="resetChangesBtn" class='button mb-2 text-6xl h-20 w-1/6 bg-red-600 rounded-lg cursor-pointer select-none
        hover:translate-y-2 hover:[box-shadow:0_0px_0_0_#b91c1c,0_0px_0_0_#1b70f841]
        hover:border-b-[0px]
        transition-all duration-150 [box-shadow:0_10px_0_0_#b91c1c,0_15px_0_0_#1b70f841]
        border-b-[1px] border-red-400'>
        <span class='flex flex-col justify-center items-center h-full text-white font-jaro text-2xl'>${i18n.t('editProfile.resetChanges')}</span>
        </div>

        <div id="changePasswordBtn" class='button mb-2 text-6xl h-20 w-1/6 bg-yellow-500 rounded-lg cursor-pointer select-none
        hover:translate-y-2 hover:[box-shadow:0_0px_0_0_#d49218,0_0px_0_0_#1b70f841]
        hover:border-b-[0px]
        transition-all duration-150 [box-shadow:0_10px_0_0_#d49218,0_15px_0_0_#1b70f841]
        border-b-[1px] border-yellow-200'>
        <span class='flex flex-col justify-center items-center h-full text-white font-jaro text-2xl'>${i18n.t('editProfile.changePassword')}</span>
        </div>
      </div>
      
      <div class="flex justify-center items-center">
        <div id="backBtn" class='button w-24 h-13 mt-10 bg-gray-700 rounded-full cursor-pointer select-none
        hover:translate-y-2 hover:[box-shadow:0_0px_0_0_#181818,0_0px_0_0_#1b70f841]
        hover:border-b-[0px]
        transition-all duration-150 [box-shadow:0_10px_0_0_#181818,0_15px_0_0_#1b70f841]
        border-b-[1px] border-gray-400'>
        <span class='flex flex-col justify-center items-center h-full text-white font-jaro'>${i18n.t('general.back')}</span>
        </div>
      </div>
    </div>
    `;

    setupEditProfilePage();
  }
}
  
let originalUserData: UserData | null = null;
let changedData: { userName?: string; email?: string; avatarFile?: File } = {};
let isGoogleUser = false; // Variable pour stocker si l'utilisateur est connecté via Google

async function uploadAvatar(file: File): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const baseUrl = window.location.origin;
    const response = await fetch(`${baseUrl}/user/avatar`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error uploading avatar:', errorText);
      return false;
    }

    const result = await response.json();
    console.log('Avatar upload result:', result);
    
    if (result.success && originalUserData?.user?.userId) {
      const profileImage = document.getElementById('profileImage') as HTMLImageElement;
      if (profileImage) {
        profileImage.src = getAvatarUrl(originalUserData.user.userId);
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return false;
  }
}
  
async function updateUserProfile(data: { userName?: string; email?: string }): Promise<boolean> {
  try {
    console.log('Attempting to update profile with data:', JSON.stringify(data));
    
    const baseUrl = window.location.origin;
    const response = await fetch(`${baseUrl}/user/profile`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error updating profile:', errorText);
      return false;
    }

    const result = await response.json();
    console.log('Profile update result:', result);
    return result.success === true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
}

async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
  try {
    const baseUrl = window.location.origin;
    const response = await fetch(`${baseUrl}/user/password`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || i18n.t('editProfile.errorChangingPassword'));
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
}

function togglePasswordChange(show: boolean) {
  const passwordChangeContainer = document.getElementById('passwordChangeContainer');
  
  if (passwordChangeContainer) {
    if (show) {
      passwordChangeContainer.classList.remove('hidden');
      const oldPasswordInput = document.getElementById('oldPassword') as HTMLInputElement;
      const newPasswordInput = document.getElementById('newPassword') as HTMLInputElement;
      const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;
      
      if (oldPasswordInput && newPasswordInput && confirmPasswordInput) {
        oldPasswordInput.value = '';
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
        oldPasswordInput.focus();
      }
    } else {
      passwordChangeContainer.classList.add('hidden');
    }
  }
}
  
function showUsernameEdit() {
  const usernameContainer = document.getElementById('usernameContainer');
  const usernameEditContainer = document.getElementById('usernameEditContainer');
  const usernameInput = document.getElementById('usernameInput') as HTMLInputElement;
  const username = document.getElementById('username');
  
  if (usernameContainer && usernameEditContainer && usernameInput && username) {
    usernameContainer.classList.add('hidden');
    usernameEditContainer.classList.remove('hidden');
    usernameInput.value = username.textContent || '';
    usernameInput.focus();
  }
}
  
function hideUsernameEdit() {
  const usernameContainer = document.getElementById('usernameContainer');
  const usernameEditContainer = document.getElementById('usernameEditContainer');
  
  if (usernameContainer && usernameEditContainer) {
    usernameContainer.classList.remove('hidden');
    usernameEditContainer.classList.add('hidden');
  }
}
  
function showEmailEdit() {
  // Si l'utilisateur est connecté via Google, on ne permet pas l'édition de l'email
  if (isGoogleUser) {
    showNotification(i18n.t('editProfile.googleEmailRestriction'), false);
    return;
  }

  const emailContainer = document.getElementById('emailContainer');
  const emailEditContainer = document.getElementById('emailEditContainer');
  const emailInput = document.getElementById('emailInput') as HTMLInputElement;
  const email = document.getElementById('email');
  
  if (emailContainer && emailEditContainer && emailInput && email) {
    emailContainer.classList.add('hidden');
    emailEditContainer.classList.remove('hidden');
    emailInput.value = email.textContent || '';
    emailInput.focus();
  }
}
  
function hideEmailEdit() {
  const emailContainer = document.getElementById('emailContainer');
  const emailEditContainer = document.getElementById('emailEditContainer');
  
  if (emailContainer && emailEditContainer) {
    emailContainer.classList.remove('hidden');
    emailEditContainer.classList.add('hidden');
  }
}

function updateUIForGoogleUser(isGoogle: boolean) {
  const editEmailBtn = document.getElementById('editEmailBtn');
  const changePasswordBtn = document.getElementById('changePasswordBtn');
  
  if (editEmailBtn) {
    // Masquer le bouton d'édition d'email pour les utilisateurs Google
    if (isGoogle) {
      editEmailBtn.classList.add('hidden');
    } else {
      editEmailBtn.classList.remove('hidden');
    }
  }
  
  if (changePasswordBtn) {
    // Désactiver le bouton de changement de mot de passe pour les utilisateurs Google
    if (isGoogle) {
      changePasswordBtn.classList.add('opacity-50', 'cursor-not-allowed');
      changePasswordBtn.setAttribute('title', i18n.t('editProfile.notAvailableForGoogle'));
      
      // Supprimer les effets de survol et les animations pour le bouton désactivé
      changePasswordBtn.classList.remove(
        'hover:translate-y-2', 
        'hover:[box-shadow:0_0px_0_0_#d49218,0_0px_0_0_#1b70f841]',
        'hover:border-b-[0px]'
      );
      
      // Ajouter un message d'information au survol
      changePasswordBtn.addEventListener('mouseenter', () => {
        showNotification(i18n.t('editProfile.googlePasswordRestriction'), false);
      });
    }
  }
}
  
async function setupEditProfilePage() {
  isGoogleUser = await checkGoogleAuthentication();
  console.log("Est un utilisateur Google:", isGoogleUser);
  
  updateUIForGoogleUser(isGoogleUser);

  originalUserData = await fetchUserProfile();
  if (originalUserData) {
    updateProfileBoxUI(originalUserData);
  } else {
    console.error("Impossible de charger les données du profil");
  }

  const profileImg = document.getElementById('img');
  const avatarUpload = document.getElementById('avatarUpload') as HTMLInputElement;
  
  if (profileImg && avatarUpload) {
    profileImg.addEventListener('click', () => {
      avatarUpload.click();
    });
    
    avatarUpload.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const files = target.files;
      
      if (files && files.length > 0) {
        const file = files[0];
        
        const profileImage = document.getElementById('profileImage') as HTMLImageElement;
        if (profileImage) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target && e.target.result) {
              profileImage.src = e.target.result as string;
            }
          };
          reader.readAsDataURL(file);
        }
        
        changedData.avatarFile = file;
      }
    });
  }

  const editUsernameBtn = document.getElementById('editUsernameBtn');
  const saveUsernameBtn = document.getElementById('saveUsernameBtn');
  const cancelUsernameBtn = document.getElementById('cancelUsernameBtn');
  
  if (editUsernameBtn) {
    editUsernameBtn.addEventListener('click', showUsernameEdit);
  }
  
  if (saveUsernameBtn) {
    saveUsernameBtn.addEventListener('click', () => {
      const usernameInput = document.getElementById('usernameInput') as HTMLInputElement;
      if (usernameInput) {
        const newUsername = usernameInput.value.trim();
        
        if (!newUsername) {
          showError(i18n.t('editProfile.errorEmptyUsername'));
          return;
        }
        
        if (newUsername.length > 7) {
          showError(i18n.t('editProfile.errorUsernameTooLong'));
          return;
        }
        
        changedData.userName = newUsername;
        
        const usernameElement = document.getElementById('username');
        if (usernameElement) {
          usernameElement.textContent = newUsername;
        }
        
        hideUsernameEdit();
      }
    });
  }
  
  if (cancelUsernameBtn) {
    cancelUsernameBtn.addEventListener('click', hideUsernameEdit);
  }

  const editEmailBtn = document.getElementById('editEmailBtn');
  const saveEmailBtn = document.getElementById('saveEmailBtn');
  const cancelEmailBtn = document.getElementById('cancelEmailBtn');
  
  if (editEmailBtn) {
    editEmailBtn.addEventListener('click', showEmailEdit);
  }
  
  if (saveEmailBtn) {
    saveEmailBtn.addEventListener('click', () => {
      const emailInput = document.getElementById('emailInput') as HTMLInputElement;
      if (emailInput) {
        const newEmail = emailInput.value.trim();
        
        if (!newEmail) {
          showError(i18n.t('editProfile.errorEmptyEmail'));
          return;
        }
        
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(newEmail)) {
          showError(i18n.t('editProfile.errorInvalidEmail'));
          return;
        }
        
        changedData.email = newEmail;
        
        const emailElement = document.getElementById('email');
        if (emailElement) {
          emailElement.textContent = newEmail;
        }
        
        hideEmailEdit();
      }
    });
  }
  
  if (cancelEmailBtn) {
    cancelEmailBtn.addEventListener('click', hideEmailEdit);
  }

  const changePasswordBtn = document.getElementById('changePasswordBtn');
  const savePasswordChangeBtn = document.getElementById('savePasswordChange') as HTMLButtonElement;
  const cancelPasswordChangeBtn = document.getElementById('cancelPasswordChange');
  
  if (changePasswordBtn && !isGoogleUser) {
    changePasswordBtn.addEventListener('click', () => {
      togglePasswordChange(true);
    });
  }
  
  if (cancelPasswordChangeBtn) {
    cancelPasswordChangeBtn.addEventListener('click', () => {
      togglePasswordChange(false);
    });
  }
  
  if (savePasswordChangeBtn) {
    savePasswordChangeBtn.addEventListener('click', async () => {
      const oldPasswordInput = document.getElementById('oldPassword') as HTMLInputElement;
      const newPasswordInput = document.getElementById('newPassword') as HTMLInputElement;
      const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;
      
      const oldPassword = oldPasswordInput.value;
      const newPassword = newPasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      
      if (!oldPassword || !newPassword || !confirmPassword) {
        showError(i18n.t('editProfile.errorAllFieldsRequired'));
        return;
      }
      
      if (newPassword.length < 6) {
        showError(i18n.t('editProfile.errorPasswordTooShort'));
        return;
      }
      
      if (newPassword !== confirmPassword) {
        showError(i18n.t('editProfile.errorPasswordsMismatch'));
        return;
      }
      
      try {
        savePasswordChangeBtn.disabled = true;
        savePasswordChangeBtn.textContent = i18n.t('editProfile.processing');
        
        const success = await changePassword(oldPassword, newPassword);
        
        if (success) {
          showNotification(i18n.t('editProfile.passwordChangedSuccess'), true);
          togglePasswordChange(false);
        } else {
          showError(i18n.t('editProfile.passwordChangeFailed'));
        }
      } catch (error: any) {
        showError(error.message || i18n.t('editProfile.errorChangingPassword'));
      } finally {
        savePasswordChangeBtn.disabled = false;
        savePasswordChangeBtn.textContent = i18n.t('general.save');
      }
    });
  }
  
  const passwordChangeContainer = document.getElementById('passwordChangeContainer');
  if (passwordChangeContainer) {
    passwordChangeContainer.addEventListener('click', function(event) {
      if (event.target === this) {
        togglePasswordChange(false);
      }
    });
  }

  const saveChangesBtn = document.getElementById('saveChangesBtn');
  if (saveChangesBtn) {
    saveChangesBtn.addEventListener('click', async () => {
      hideError();
      
      if (Object.keys(changedData).length === 0) {
        showError(i18n.t('editProfile.errorNoChanges'));
        return;
      }
      
      saveChangesBtn.classList.add('opacity-50');
      saveChangesBtn.setAttribute('disabled', 'true');
      
      let success = true;
      let errorMessage = '';
      
      try {
        if (changedData.avatarFile) {
          const avatarSuccess = await uploadAvatar(changedData.avatarFile);
          if (!avatarSuccess) {
            success = false;
            errorMessage += i18n.t('editProfile.errorUploadAvatar') + ' ';
          }
        }
        
        if ((changedData.userName || (changedData.email && !isGoogleUser))) {
          const updateData: { userName?: string; email?: string } = {};
          if (changedData.userName) updateData.userName = changedData.userName;
          if (changedData.email && !isGoogleUser) updateData.email = changedData.email;
          
          const profileSuccess = await updateUserProfile(updateData);
          if (!profileSuccess) {
            success = false;
            errorMessage += i18n.t('editProfile.errorUpdateProfile') + ' ';
          }
        }
        
        if (success) {
          showNotification(i18n.t('editProfile.profileUpdatedSuccess'), true);
          
          originalUserData = await fetchUserProfile();
          changedData = {};
          if (originalUserData) {
            updateProfileBoxUI(originalUserData);
          }
        } else {
          showError(`${i18n.t('editProfile.updateFailed')}: ${errorMessage}${i18n.t('editProfile.checkConnection')}`);
        }
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement des modifications:', error);
        showError(`${i18n.t('editProfile.errorOccurred')}: ${error}`);
      } finally {
        saveChangesBtn.classList.remove('opacity-50');
        saveChangesBtn.removeAttribute('disabled');
      }
    });
  }

  const resetChangesBtn = document.getElementById('resetChangesBtn');
  if (resetChangesBtn && originalUserData) {
    resetChangesBtn.addEventListener('click', () => {
      updateProfileBoxUI(originalUserData);
      hideUsernameEdit();
      hideEmailEdit();
      changedData = {};
      
      showNotification(i18n.t('editProfile.changesReset'), true);
    });
  }

  // Back button
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (Object.keys(changedData).length > 0) {
        if (confirm(i18n.t('editProfile.confirmUnsavedChanges'))) {
          history.pushState(null, '', '/profile');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      } else {
        history.pushState(null, '', '/profile');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    });
  }
}