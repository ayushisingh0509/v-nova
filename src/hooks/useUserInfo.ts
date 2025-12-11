interface UserInfo {
  name: string;
  email: string;
  address: string;
  phone: string;
  cardName?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

export const useUserInfo = () => {
  const getUserInfo = (): UserInfo => {
    const storedInfo = localStorage.getItem('userInfo');
    return storedInfo ? JSON.parse(storedInfo) : {
      name: '',
      email: '',
      address: '',
      phone: '',
      cardName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    };
  };

  const updateUserInfo = (info: Partial<UserInfo>) => {
    const currentInfo = getUserInfo();
    const newInfo = { ...currentInfo, ...info };
    localStorage.setItem('userInfo', JSON.stringify(newInfo));
  };

  return { getUserInfo, updateUserInfo };
};