import { Document, model, Schema } from 'mongoose';

export interface IToken extends Document {
  refreshToken: string;
  userId: string;
  publicKey: string;
  privateKey: string;
  refreshTokenUsed: Array<string>;
}

const tokenSchema = new Schema<IToken>({
  refreshToken: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  publicKey: {
    type: String,
    required: true
  },
  privateKey: {
    type: String,
    required: true
  },
  refreshTokenUsed: {
    type: [String],
    default: []
  }
});

const Token = model<IToken>('Token', tokenSchema);

export default Token;
