export interface UpdateInfoUserBody {
  id: string;
  email: string;
  name: string;
  publicKey: string;
}

export interface ChangePasswordBody {
  id: string;
  oldPassword: string;
  newPassword: string;
}

export interface UploadAvatarBody {
  id: string;
  avatar: string;
  publicKey: string;
}
