import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';

interface CreateAccountProps {
  onCreateAccount: (name: string, email: string, pass: string) => void;
  onNavigateToLogin: () => void;
}

const CreateAccount: React.FC<CreateAccountProps> = ({ onCreateAccount, onNavigateToLogin }) => {
  const { t } = useLocalization();
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    ssn: '',
    address: '',
    phone: '',
    email: '',
    password: '',
    employmentStatus: 'employed',
    employerName: '',
    jobTitle: '',
    startDate: '',
    income: '',
    loanAmount: '',
    loanPurpose: 'debt_consolidation',
    monthlyExpenses: '',
    hasUSAccount: 'yes',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // In a real app, you'd send all formData to the backend.
      // For this demo, we only need name, email, and password for the user object.
      onCreateAccount(formData.fullName, formData.email, formData.password);
    }, 1000);
  };
  
  const renderFileUpload = (id: string, label: string, note?: string) => (
      <div className="form-control w-full">
          <label htmlFor={id} className="label">
            <span className="label-text">{label}</span>
          </label>
          <input type="file" id={id} className="file-input file-input-bordered w-full" />
          {note && <div className="label"><span className="label-text-alt">{note}</span></div>}
      </div>
  );

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-2xl" title={t('create_account_title')}>
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Personal Information */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">{t('section_personal_info')}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Input label={t('full_name')} id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
              <Input label={t('date_of_birth')} id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
              <Input label={t('email_address')} id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              <Input label={t('password')} id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
              <Input label={t('ssn_itin')} id="ssn" name="ssn" value={formData.ssn} onChange={handleChange} required />
              <Input label={t('phone')} id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
            </div>
             <Input label={t('current_address')} id="address" name="address" value={formData.address} onChange={handleChange} required />
             {renderFileUpload('id_upload', t('id_document'))}
          </section>

          {/* Section 2: Professional Situation */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">{t('section_professional_info')}</h3>
            <div className="form-control">
                <label className="label"><span className="label-text">{t('employment_status')}</span></label>
                <select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} className="select select-bordered">
                    <option value="employed">{t('status_employed')}</option>
                    <option value="self_employed">{t('status_self_employed')}</option>
                    <option value="unemployed_other">{t('status_unemployed_other')}</option>
                </select>
            </div>
            {formData.employmentStatus !== 'unemployed_other' && (
                <div className="grid md:grid-cols-2 gap-4">
                    <Input label={t('employer_name')} id="employerName" name="employerName" value={formData.employerName} onChange={handleChange} />
                    <Input label={t('job_title')} id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} />
                    <Input label={t('start_date')} id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
                    <Input label={t('monthly_income')} id="income" name="income" type="number" value={formData.income} onChange={handleChange} />
                </div>
            )}
          </section>

          {/* Section 3: Financial Details */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">{t('section_financial_details')}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Input label={t('loan_amount_requested')} id="loanAmount" name="loanAmount" type="number" value={formData.loanAmount} onChange={handleChange} required />
              <div className="form-control">
                  <label className="label"><span className="label-text">{t('loan_purpose')}</span></label>
                  <select name="loanPurpose" value={formData.loanPurpose} onChange={handleChange} className="select select-bordered">
                      <option value="debt_consolidation">{t('purpose_debt_consolidation')}</option>
                      <option value="vehicle_purchase">{t('purpose_vehicle_purchase')}</option>
                      <option value="home_improvement">{t('purpose_home_improvement')}</option>
                      <option value="other">{t('purpose_other')}</option>
                  </select>
              </div>
            </div>
             <Input label={t('estimated_monthly_expenses')} id="monthlyExpenses" name="monthlyExpenses" type="number" value={formData.monthlyExpenses} onChange={handleChange} required />
             <div className="form-control">
                <label className="label"><span className="label-text">{t('has_us_bank_account')}</span></label>
                <div className="flex gap-4">
                    <label className="label cursor-pointer"><input type="radio" name="hasUSAccount" value="yes" checked={formData.hasUSAccount === 'yes'} onChange={handleChange} className="radio radio-primary" /> <span className="label-text ml-2">{t('yes')}</span></label>
                    <label className="label cursor-pointer"><input type="radio" name="hasUSAccount" value="no" checked={formData.hasUSAccount === 'no'} onChange={handleChange} className="radio radio-primary" /> <span className="label-text ml-2">{t('no')}</span></label>
                </div>
             </div>
          </section>

          {/* Submission */}
          <div className="flex flex-col items-center gap-4 pt-4">
            <Button type="submit" className="w-full md:w-auto" isLoading={isLoading}>{t('submit_application')}</Button>
            <button type="button" onClick={onNavigateToLogin} className="text-sm text-primary hover:underline">{t('back_to_login')}</button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateAccount;