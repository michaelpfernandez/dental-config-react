declare module './clientLogger' {
  export const clientLogger: {
    info: (message: string, data?: any) => void;
    error: (message: string, data?: any) => void;
  };
}
