// import { useSelector } from "react-redux";

// export function useHasPermission(permission) {
//   const { user } = useSelector((state) => state.auth);

//   // user?.permissions is expected to be an array from backend
//   if (!user?.permissions || user.permissions.length === 0) return false;

//   // check dynamically
//   return user.permissions.includes(permission);
// }


import { useSelector } from 'react-redux';

const useHasPermission = (requiredPermission) => {
  const { permissions } = useSelector(state => state.auth);

  console.log("=== PERMISSION CHECK ===");
  console.log("Available permissions:", permissions);
  console.log("Checking for permission:", requiredPermission);

  const hasPermission = permissions.includes(requiredPermission);

  console.log("Result:", hasPermission);
  console.log("=== END CHECK ===");

  return hasPermission;
};

export default useHasPermission;