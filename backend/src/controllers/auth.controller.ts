import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin';
import { AuthRequest } from '../types';
import { createError } from '../middlewares/errorHandler.middleware';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError('Email et mot de passe requis', 400);
    }

    const admin = await Admin.findOne({ email: email.toLowerCase(), actif: true });
    if (!admin) {
      throw createError('Identifiants incorrects', 401);
    }

    const isValid = await admin.comparePassword(password);
    if (!isValid) {
      throw createError('Identifiants incorrects', 401);
    }

    const secret = process.env.JWT_SECRET!;
    const token = jwt.sign(
      { id: admin._id.toString(), role: admin.role, email: admin.email },
      secret,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: admin._id,
          nom: admin.nom,
          email: admin.email,
          role: admin.role,
        },
      },
      message: 'Connexion réussie',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const admin = await Admin.findById(req.user!.id);
    if (!admin) {
      throw createError('Utilisateur non trouvé', 404);
    }

    res.json({
      success: true,
      data: {
        id: admin._id,
        nom: admin.nom,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
