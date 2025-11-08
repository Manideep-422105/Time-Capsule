import React, { useState } from "react";
import ProgressBar from "../components/CapsuleCreation.js/ProgressIndicator";
import CapsuleFormDetails from "../components/CapsuleCreation.js/CapsuleFormInfo";
import CapsuleFormMedia from "../components/CapsuleCreation.js/CapsuleFormMedia";
import CapsuleReview from "../components/CapsuleCreation.js/CapsuleReview";

const CreateCapsule = () => {
  const [step, setStep] = useState(1);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <ProgressBar currentStep={step} />

      {step === 1 && <CapsuleFormDetails nextStep={() => setStep(2)} />}
      {step === 2 && (
        <CapsuleFormMedia
          nextStep={() => setStep(3)}
          prevStep={() => setStep(1)}
        />
      )}
      {step === 3 && <CapsuleReview prevStep={() => setStep(2)} />}
    </div>
  );
};

export default CreateCapsule;
