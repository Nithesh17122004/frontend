export const cleanupLocalStorage = () => {
  try {
    // Check and clean user data
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        JSON.parse(userStr);
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        console.log('Cleaned invalid user data from localStorage');
      }
    }
    
    // Check if token exists without user
    const token = localStorage.getItem('token');
    if (token && !localStorage.getItem('user')) {
      localStorage.removeItem('token');
      console.log('Cleaned orphaned token from localStorage');
    }
  } catch (error) {
    console.error('Error cleaning localStorage:', error);
  }
};

// Run cleanup on import
cleanupLocalStorage();