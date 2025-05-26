import mongoose from 'mongoose';

const schema = mongoose.Schema;
const vatSchema = new schema({
    vat: {
        type: Number,
        required: true
    }
},{ timestamps: true });

const Vat = mongoose.model('Vat', vatSchema);
export default Vat;