import React from 'react';

interface RequirementsFormProps {
  specialRequirements: string;
  additionalInfo: string;
  onSpecialRequirementsChange: (value: string) => void;
  onAdditionalInfoChange: (value: string) => void;
}

export const RequirementsForm: React.FC<RequirementsFormProps> = ({
  specialRequirements,
  additionalInfo,
  onSpecialRequirementsChange,
  onAdditionalInfoChange,
}) => {
  return (
    <div className="w-full p-6 bg-slate-800 rounded-xl shadow-xl border border-panel-border backdrop-blur-xs bg-panel space-y-6">
      <div>
        <label htmlFor="specialRequirements" className="block text-lg font-medium text-slate-200 mb-2">
          المتطلبات الخاصة (اختياري)
        </label>
        <textarea
          id="specialRequirements"
          name="specialRequirements"
          rows={3}
          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-slate-100 placeholder-slate-400 text-sm"
          placeholder="أدخل هنا أي متطلبات خاصة مثل نوع المحتوى، الهدف، أو المنصة المستهدفة..."
          value={specialRequirements}
          onChange={(e) => onSpecialRequirementsChange(e.target.value)}
          aria-describedby="specialRequirementsHelp"
        />
        <p id="specialRequirementsHelp" className="mt-2 text-xs text-slate-400">
          مثال: "أرغب في تحليل للتركيز على تطور الشخصية الرئيسية، وإنشاء مشهد إضافي بأسلوب الكاتب يتناسب مع جمهور الشباب."
        </p>
      </div>

      <div>
        <label htmlFor="additionalInfo" className="block text-lg font-medium text-slate-200 mb-2">
          معلومات إضافية (اختياري)
        </label>
        <textarea
          id="additionalInfo"
          name="additionalInfo"
          rows={3}
          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-slate-100 placeholder-slate-400 text-sm"
          placeholder="أدخل هنا أي معلومات إضافية مفيدة حول المؤلف أو العمل..."
          value={additionalInfo}
          onChange={(e) => onAdditionalInfoChange(e.target.value)}
          aria-describedby="additionalInfoHelp"
        />
        <p id="additionalInfoHelp" className="mt-2 text-xs text-slate-400">
          مثال: "الكاتب معروف باستخدامه للغة رمزية معقدة، والعمل ينتمي إلى فترة ما بعد الحداثة."
        </p>
      </div>
    </div>
  );
};
