import { Request, Response } from 'express';
import { handleIdentify } from '../services/contactService';

export const identifyContact = async (req: Request, res: Response) => {
  try {
    const result = await handleIdentify(req.body);
    res.status(200).json({ contact: result });
  } catch (error) {
    console.error('Error in identify controller:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
