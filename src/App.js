import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import "./App.css";

const App = () => {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();
  const [formStructure, setFormStructure] = useState(null);
  const [submittedData, setSubmittedData] = useState([]);
  const [progress, setProgress] = useState(0);
  const [editIndex, setEditIndex] = useState(null); // To track which row is being edited

  const dropdownOptions = [
    { label: "Select Form Type", value: "" },
    { label: "User Information", value: "userInfo" },
    { label: "Address Information", value: "addressInfo" },
    { label: "Payment Information", value: "paymentInfo" },
  ];

  const formResponses = {
    userInfo: {
      fields: [
        {
          name: "firstName",
          type: "text",
          label: "First Name",
          required: true,
        },
        { name: "lastName", type: "text", label: "Last Name", required: true },
        { name: "age", type: "number", label: "Age", required: false },
      ],
    },
    addressInfo: {
      fields: [
        { name: "street", type: "text", label: "Street", required: true },
        { name: "city", type: "text", label: "City", required: true },
        {
          name: "state",
          type: "dropdown",
          label: "State",
          options: ["California", "Texas", "New York"],
          required: true,
        },
        { name: "zipCode", type: "text", label: "Zip Code", required: false },
      ],
    },
    paymentInfo: {
      fields: [
        {
          name: "cardNumber",
          type: "text",
          label: "Card Number",
          required: true,
        },
        {
          name: "expiryDate",
          type: "date",
          label: "Expiry Date",
          required: true,
        },
        {
          name: "cvv",
          type: "password",
          label: "CVV",
          required: true,
          validation: {
            pattern: /^[0-9]{3,4}$/,
            message: "CVV must be a 3- or 4-digit number.",
          },
        },
        {
          name: "cardholderName",
          type: "text",
          label: "Cardholder Name",
          required: true,
        },
      ],
    },
  };

  const formType = watch("formType");

  useEffect(() => {
    if (formType) {
      setFormStructure(formResponses[formType]);
      reset({ formType });
      setProgress(0);
    }
  }, [formType, reset]);

  const onSubmit = (data) => {
    if (editIndex !== null) {
      const updatedData = [...submittedData];
      updatedData[editIndex] = data;
      setSubmittedData(updatedData);
      alert("Changes saved successfully.");
      setEditIndex(null);
    } else {
      setSubmittedData([...submittedData, data]);
      alert("Form submitted successfully!");
    }
    reset();
    setProgress(0);
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    reset(submittedData[index]);
  };

  const handleDelete = (index) => {
    const updatedData = submittedData.filter((_, i) => i !== index);
    setSubmittedData(updatedData);
    alert("Entry deleted successfully!");
  };

  const calculateProgress = () => {
    if (!formStructure) return 0;
    const totalFields = formStructure.fields.length;
    const filledFields = formStructure.fields.reduce(
      (acc, field) => (watch(field.name) ? acc + 1 : acc),
      0
    );
    setProgress((filledFields / totalFields) * 100);
  };

  useEffect(() => {
    calculateProgress();
  }, [watch]);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <h1>Welcome to Dynamic Forms</h1>
      </header>

      {/* Main Content */}
      <main>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="formType">Select Form Type</label>
            <Controller
              name="formType"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <select {...field} id="formType" className="form-control">
                  {dropdownOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>

          {formStructure &&
            formStructure.fields.map((field, index) => (
              <div className="form-group" key={index}>
                <label htmlFor={field.name}>{field.label}</label>
                <Controller
                  name={field.name}
                  control={control}
                  defaultValue=""
                  rules={{
                    required: field.required,
                    pattern: field.validation?.pattern
                      ? {
                          value: field.validation.pattern,
                          message: field.validation.message,
                        }
                      : undefined,
                  }}
                  render={({ field: controllerField }) =>
                    field.type === "dropdown" ? (
                      <select
                        {...controllerField}
                        id={field.name}
                        className="form-control"
                      >
                        <option value="">Select {field.label}</option>
                        {field.options.map((option, i) => (
                          <option key={i} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        {...controllerField}
                        type={field.type}
                        id={field.name}
                        className="form-control"
                      />
                    )
                  }
                />
                {errors[field.name] && (
                  <p className="error-text">
                    {errors[field.name]?.message ||
                      `${field.label} is required.`}
                  </p>
                )}
              </div>
            ))}

          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          <button type="submit" className="button button1">
            {editIndex !== null ? "Save Changes" : "Submit"}
          </button>
        </form>

        <h2>Submitted Data</h2>
        {submittedData.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                {Object.keys(submittedData[0]).map((key, index) => (
                  <th key={index}>{key}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submittedData.map((data, index) => (
                <tr key={index}>
                  {Object.values(data).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEdit(index)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(index)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>&copy; 2024 Application. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
