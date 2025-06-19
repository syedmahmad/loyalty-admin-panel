import { Merriweather, Poppins } from "next/font/google";

// If loading a variable font, you don't need to specify the font weight
export const poppins = Poppins({ 
    subsets: ['latin'], 
    display: 'swap',
    weight: ['100', '200', '300', '400', '500', '600', '700','800', '900'] 
  });
  
export const merriweather = Merriweather({ 
    subsets: ['latin'], 
    display: 'swap',
    weight: ['300', '400', '700', '900'] 
  });