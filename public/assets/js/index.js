// index.js

document
  .getElementById("btn_add")
  .addEventListener("click", async function (event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    // Gather your form data
    const data = {
      local_id: document.getElementById("local_id").value,
      campaign_name: document.getElementById("campaign_name").value,
      content_type: document.getElementById("content_type").value,
      asset_id: document.getElementById("asset_id").value,
      catalog_id: document.getElementById("catalog_id").value,
      stg_url: document.getElementById("stg_url").value,
      year: new Date().getUTCFullYear(),
    };

    try {
      const {
        asset_id,
        campaign_name,
        catalog_id,
        content_type,
        local_id,
        stg_url,
      } = data ?? {};
      if (
        asset_id.trim() === "" ||
        campaign_name.trim() === "" ||
        content_type.trim() === "" ||
        local_id.trim() === "" ||
        catalog_id.trim() === "" ||
        stg_url.trim() === ""
      ) {
        showErrorModal("All fields are required");
        return;
      }

      const response = await fetch("/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      await response.text();

      // Reset form fields
      resetFormFields();

      // After successful submission, show success modal
      showSuccessModal();

      // Update the download link to point to the generated CSV
      const downloadLink = document.getElementById("downloadLink");
      downloadLink.href = `/generated_csv/${data.campaign_name}.csv`;
      downloadLink.style.display = "block"; // Show the download link

      // Reload the window after 3 seconds
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle errors, e.g., by showing an error message in your UI
    }
  });

// Function to reset form fields
const resetFormFields = () => {
  document.getElementById("local_id").value = "";
  document.getElementById("campaign_name").value = "";
  document.getElementById("content_type").value = "";
  document.getElementById("asset_id").value = "";
  document.getElementById("catalog_id").value = "";
  document.getElementById("stg_url").value = "";
};

// Function to show success modal
const showSuccessModal = () => {
  const successModal = document.getElementById("successModal");
  successModal.classList.remove("hidden");

  // Close the modal after 3 seconds
  setTimeout(() => {
    successModal.classList.add("hidden");
  }, 1000);
};

// Get modal, modal overlay
const errorModal = document.getElementById("errorModal");
const modalOverlay = document.getElementById("modalOverlay");

// Close modal function
const closeErrorModal = () => {
  errorModal.classList.add("hidden");
};

// Add event listener to modal overlay to close modal when clicked outside of modal content
modalOverlay.addEventListener("click", (event) => {
  if (event.target === modalOverlay) {
    closeErrorModal();
  }
});

// Function to show error modal with message
const showErrorModal = (errorMessage) => {
  const modalErrorMessage = document.getElementById("modalErrorMessage");
  modalErrorMessage.textContent = errorMessage;
  errorModal.classList.remove("hidden");
};

// Fetch available years from server and populate year select field
const populateYears = async () => {
  try {
    const response = await fetch("/api/years");
    const years = await response.json();
    const selectYear = document.getElementById("submitted_year");
    selectYear.innerHTML = "<option value='' selected disabled>Select Year</option>"; // Set default empty option

    years.forEach((year) => {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      selectYear.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching years:", error);
  }
};


// Call the populateYears function when the page loads
populateYears();

// Fetch available campaign names from server and populate campaign name dropdown
async function populateCampaigns() {
  try {
    const response = await fetch("/api/campaigns");
    const campaigns = await response.json();
    console.log(campaigns, "campaigns");
    const remove_git_keep = campaigns.filter((item) => item !== ".gitkeep");
    
    const selectCampaign = document.getElementById("submitted_campaign_name");
    selectCampaign.innerHTML = "<option value='' selected disabled>Select Campaign</option>"; // Set default empty option

    remove_git_keep.forEach((campaign) => {
      const option = document.createElement("option");
      option.value = campaign;
      option.textContent = campaign;
      selectCampaign.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
  }
}

// Call the populateCampaigns function when the page loads
populateCampaigns();
