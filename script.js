
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("inputForm");
    // Form submission for recipe generation
    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent the form from refreshing the page

        // Get the form values
        const workoutType = document.getElementById("workoutType").value;
        const caloriesBurned = document.getElementById("caloriesBurned").value;
        const ingredients = document.getElementById("ingredients").value;
        const allergies = document.getElementById("allergies").value;

        const physicalEffort = document.getElementById("physicalEffort").value;

        // Combine inputs to create a prompt for the OpenAI API
        const prompt = `Design a tailored, post-workout meal recipe using only the following ingredients: ${ingredients}. 
        The user just completed a ${workoutType} workout, burning approximately ${caloriesBurned} calories, 
        so prioritize high-protein ingredients to support recovery using only the given ingredients. 
        Make sure the quantity of protein is proportional to the physical effort of the workout and the number of calories that have been burnt.
        Craft a step-by-step recipe with commonly available kitchen tools. 
        Ensure that preparation is simple and achievable within 1 hour, while keeping the instructions clear and 
        concise for all skill levels. Avoid these allergens: ${allergies}.
        Also, include a brief description of the meal at the beginning, highlighting its nutritional benefits 
        and the workout it complements.
        Format of the recipe: 
        Introduction
        Recipe steps labelled by numbers
        Conclusion with serving size and any additional notes.`;

        try {
            // Call the OpenAI API
            const recipe = await getRecipeFromOpenAI(prompt);
            displayRecipe(recipe);
        } catch (error) {
            console.error("Error fetching recipe:", error);
            alert("There was an error fetching your recipe. Please try again.");
        }
    });

    // // Event listener for calculating water intake
    // document.getElementById("calculateWaterBtn").addEventListener("click", function () {
    //     const weight = parseFloat(document.getElementById("weight").value);
    //     const height = parseFloat(document.getElementById("height").value);
    //     const caloriesBurned = parseFloat(document.getElementById("caloriesBurned").value);

    //     if (!weight || !height || !caloriesBurned) {
    //         alert("Please enter valid values for weight, height, and calories burned.");
    //         return;
    //     }

    //     // Calculate water intake
    //     const waterInfo = calculateWaterIntake(weight, height, caloriesBurned);
    //     displayWaterIntake(waterInfo);
    // });
});

async function getRecipeFromOpenAI(prompt) {
    const response = await fetch("http://localhost:3002/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt }),
    });

    const data = await response.json();
    if (!response.ok) {
        console.error("Server error:", data.error);
        throw new Error(data.error || "Error fetching recipe.");
    }

    return data.recipe;
}

// Function to display the recipe on the page
function displayRecipe(recipe) {
    let resultsSection = document.getElementById("results");
    if (!resultsSection) {
        resultsSection = document.createElement("div");
        resultsSection.id = "results";
        document.body.appendChild(resultsSection);
    }

    let recipeArray;
    if (Array.isArray(recipe)) {
        recipeArray = recipe; // If it's already an array
    } else if (typeof recipe === 'string') {
        recipeArray = [recipe]; // If it's a string, wrap it in an array
    } else {
        console.error("Unexpected recipe format:", recipe);
        resultsSection.innerHTML = "<p>Error: Received an unexpected format for the recipe.</p>";
        return;
    }
    var converter = new showdown.Converter();
    let updatedContent = recipeArray.map(step => converter.makeHtml(step)).join(''); // Convert each step to HTML

    resultsSection.style.display = "block";
    resultsSection.innerHTML = `<h2 style="color:#163b1a";>Your Recipe:</h2><p>${updatedContent}</p>`;
}

// function calculateWaterIntake(weightKg, heightM, caloriesBurnt) {
//     const bmi = weightKg / (heightM * heightM);
//     const waterNeeded = weightKg * 30; // base water in mL
//     const additionalWater = (caloriesBurnt / 1000) * 500; // additional water in mL
//     const totalWaterIntake = waterNeeded + additionalWater;

//     const waterInfo = {
//         bmi: bmi.toFixed(2),
//         waterNeeded: waterNeeded,
//         additionalWater: additionalWater,
//         totalWaterIntake: totalWaterIntake
//     };
//     displayWaterIntake(waterInfo);
// }

// function displayWaterIntake(waterInfo) {
//     let waterSection = document.getElementById("waterResults");
//     if (!waterSection) {
//         waterSection = document.createElement("div");
//         waterSection.id = "waterResults";
//         document.body.appendChild(waterSection);
//     }
//     waterSection.style.display = "block";
//     waterSection.innerHTML = `<h2>Water Intake Recommendation:</h2>
//                               <p>BMI: ${waterInfo.bmi}</p>
//                               <p>Base Water Needed: ${waterInfo.waterNeeded} mL</p>
//                               <p>Additional Water for Calories Burned: ${waterInfo.additionalWater} mL</p>
//                               <p>Total Water Intake: ${waterInfo.totalWaterIntake} mL</p>`;
// }