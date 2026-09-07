import mongoose, { Document, Schema } from 'mongoose';

export interface IAgentDocument extends Document {
  matricule: string;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F';
  dateNaissance: Date;
  lieuNaissance: string;
  photo?: string;
  fonction: string;
  affectation: string;
  telephone: string;
  dateRecrutement: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new Schema<IAgentDocument>(
  {
    matricule: {
      type: String,
      required: [true, 'Le matricule est obligatoire'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    nom: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true,
      uppercase: true,
    },
    prenom: {
      type: String,
      required: [true, 'Le prénom est obligatoire'],
      trim: true,
    },
    sexe: {
      type: String,
      enum: ['M', 'F'],
      required: [true, 'Le sexe est obligatoire'],
    },
    dateNaissance: {
      type: Date,
      required: [true, 'La date de naissance est obligatoire'],
    },
    lieuNaissance: {
      type: String,
      required: [true, 'Le lieu de naissance est obligatoire'],
      trim: true,
    },
    photo: {
      type: String,
      default: null,
    },
    fonction: {
      type: String,
      required: [true, 'La fonction est obligatoire'],
      trim: true,
    },
    affectation: {
      type: String,
      required: [true, 'L\'affectation est obligatoire'],
      trim: true,
    },
    telephone: {
      type: String,
      required: [true, 'Le téléphone est obligatoire'],
      trim: true,
    },
    dateRecrutement: {
      type: Date,
      required: [true, 'La date de recrutement est obligatoire'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index textuel pour la recherche
AgentSchema.index({ nom: 'text', prenom: 'text', matricule: 'text' });

export const Agent = mongoose.model<IAgentDocument>('Agent', AgentSchema);
