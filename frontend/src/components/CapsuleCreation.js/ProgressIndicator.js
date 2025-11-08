import React from "react";
// REMOVE: No longer needed as we're using props
// import { useSelector } from "react-redux"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { colors } from "../Theme";

// 1. Accept 'currentStep' as a prop
const ProgressIndicator = ({ currentStep }) => {
  // 2. Remove the useSelector hook
  // const { capsuleCreateStep } = useSelector((state) => state.capsule);

  // 3. Use the 'currentStep' prop instead of 'capsuleCreateStep' everywhere
  return (
    <div
      style={{
        width: "100%",
        margin: "10px 0",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "flex-start",
      }}
    >
      {/* Step 1 - Fill Info */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
        <div
          style={{
            display: "flex",
            border: `2px solid ${colors.color_purple}`,
            backgroundColor: currentStep === 1 ? "transparent" : colors.color_purple,
            borderRadius: "50%",
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {currentStep === 1 ? (
            <span style={{ color: colors.color_purple, fontWeight: "800", fontSize: 16 }}>1</span>
          ) : (
            <FontAwesomeIcon icon={faCheck} style={{ color: colors.color_white, fontSize: 20 }} />
          )}
        </div>
        <div style={{ fontSize: 14, fontWeight: "600", color: colors.color_purple }}>Fill Info</div>
      </div>

      {/* Connector */}
      <div
        style={{
          borderTopStyle: "dotted",
          borderTopWidth: 1.5,
          width: "20%",
          borderColor: currentStep === 1 ? colors.color_light_cyan : colors.color_purple,
          marginTop: 20,
        }}
      />

      {/* Step 2 - Upload Media */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
        <div
          style={{
            display: "flex",
            border: `2px solid ${
              currentStep < 2 ? colors.color_light_cyan : colors.color_purple
            }`,
            backgroundColor: currentStep <= 2 ? "transparent" : colors.color_purple,
            borderRadius: "50%",
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {currentStep <= 2 ? (
            <span
              style={{
                color: currentStep < 2 ? colors.color_light_cyan : colors.color_purple,
                fontWeight: "800",
                fontSize: 16,
              }}
            >
              2
            </span>
          ) : (
            <FontAwesomeIcon icon={faCheck} style={{ color: colors.color_white, fontSize: 20 }} />
          )}
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: currentStep < 2 ? colors.color_light_cyan : colors.color_purple,
          }}
        >
          Upload Media
        </div>
      </div>

      {/* Connector */}
      <div
        style={{
          borderTopStyle: "dotted",
          borderTopWidth: 1.5,
          width: "20%",
          borderColor: currentStep <= 2 ? colors.color_light_cyan : colors.color_purple,
          marginTop: 20,
        }}
      />

      {/* Step 3 - Review & Submit */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
        <div
          style={{
            display: "flex",
            border: `2px solid ${
              currentStep < 3 ? colors.color_light_cyan : colors.color_purple
            }`,
            backgroundColor: currentStep <= 3 ? "transparent" : colors.color_purple,
            borderRadius: "50%",
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {currentStep <= 3 ? (
            <span
              style={{
                color: currentStep < 3 ? colors.color_light_cyan : colors.color_purple,
                fontWeight: "800",
                fontSize: 16,
              }}
            >
              3
            </span>
          ) : (
            <FontAwesomeIcon icon={faCheck} style={{ color: colors.color_white, fontSize: 20 }} />
          )}
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: currentStep < 3 ? colors.color_light_cyan : colors.color_purple,
          }}
        >
          Review & Submit
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;