declare module './clientLogger' {
  export const clientLogger: {
    info: (message: string, data?: any) => void;
    // Add other methods if necessary
  };
}
