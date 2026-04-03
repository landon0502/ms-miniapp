// 系统配置状态
let sysEnabled = true; // 默认启用

export const a = () => sysEnabled;
export const b = (status) => {
  sysEnabled = status;
  return sysEnabled;
};