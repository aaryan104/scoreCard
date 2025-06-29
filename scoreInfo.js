document.addEventListener("DOMContentLoaded", function () {
      // Initialize match data
      const matchData = {
        teams: {
          teamA: "TEAM A",
          teamB: "TEAM B",
        },
        innings: 1,
        maxOvers: 20,
        maxWickets: 10,
        firstInnings: {
          runs: 0,
          wickets: 0,
          overs: 0,
          balls: 0,
          overHistory: [],
        },
        secondInnings: {
          runs: 0,
          wickets: 0,
          overs: 0,
          balls: 0,
          overHistory: [],
        },
        currentInningsData: function () {
          return this.innings === 1 ? this.firstInnings : this.secondInnings;
        },
        currentOver: [],
        ballHistory: [],
        isMatchEnded: false,
      };
      // Initialize with starting values
      matchData.maxOvers = parseInt(document.getElementById("total-overs-input").value || "10");
      matchData.maxWickets = parseInt(document.getElementById("max-wickets-input").value || "10");
      matchData.firstInnings.runs = 0;
      matchData.firstInnings.wickets = 0;
      matchData.firstInnings.overs = 0;
      matchData.firstInnings.balls = 0;
      // Update UI with initial data
      updateScoreDisplay();
      // Function to update the main score display
      function updateScoreDisplay() {
        const currentInnings = matchData.currentInningsData();
        // Update main score
        document.getElementById("total-runs").textContent = currentInnings.runs;
        document.getElementById("total-wickets").textContent =
          currentInnings.wickets;
        document.getElementById("total-overs").textContent = currentInnings.overs;
        document.getElementById("current-balls").textContent = currentInnings.balls;
        // Update innings indicator
        document.getElementById("innings-indicator").textContent =
          matchData.innings === 1 ? "1st Innings" : "2nd Innings";
        // Toggle innings-specific info
        if (matchData.innings === 1) {
          document.getElementById("first-innings-info").classList.remove("hidden");
          document.getElementById("second-innings-info").classList.add("hidden");
          // Calculate and update current run rate
          const totalOvers = currentInnings.overs + currentInnings.balls / 6;
          const runRate =
            totalOvers > 0 ? (currentInnings.runs / totalOvers).toFixed(2) : "0.00";
          document.getElementById("current-run-rate").textContent = runRate;
          // Calculate projected score
          const remainingOvers = matchData.maxOvers - totalOvers;
          const projectedScore = Math.round(
            currentInnings.runs + remainingOvers * parseFloat(runRate),
          );
          document.getElementById("projected-score").textContent = projectedScore;
        } else {
          document.getElementById("first-innings-info").classList.add("hidden");
          document.getElementById("second-innings-info").classList.remove("hidden");
          // Calculate runs required and balls remaining
          const runsRequired =
            matchData.firstInnings.runs + 1 - currentInnings.runs;
          const ballsRemaining =
            matchData.maxOvers * 6 -
            (currentInnings.overs * 6 + currentInnings.balls);
          document.getElementById("runs-required").textContent = Math.max(
            0,
            runsRequired,
          );
          document.getElementById("balls-remaining").textContent = ballsRemaining;
          // Calculate required run rate
          const reqRunRate =
            ballsRemaining > 0
              ? ((runsRequired * 6) / ballsRemaining).toFixed(2)
              : "0.00";
          document.getElementById("req-run-rate").textContent = reqRunRate;
          // Check if match is ended
          
          if (runsRequired <= 0 && !matchData.isMatchEnded) 
          {
            showMatchEndMessage(matchData.teams.teamB, `${matchData.maxWickets - currentInnings.wickets} wickets`);
          }
          else if (currentInnings.wickets >= matchData.maxWickets && !matchData.isMatchEnded) 
          {
            showMatchEndMessage(matchData.teams.teamA, `${runsRequired - 1} runs`);
          }
          else if ((currentInnings.overs >= matchData.maxOvers || ballsRemaining <= 0) && !matchData.isMatchEnded) 
          {
            showMatchEndMessage(matchData.teams.teamA, `${runsRequired - 1} runs`);
          }
        }
        // Update New Over button state
        // const newOverBtn = document.getElementById("new-over-btn");
        // if (currentInnings.balls >= 6) {
        //   newOverBtn.disabled = false;
        // } else {
        //   newOverBtn.disabled = true;
        // }
      }

      function switchToSecondInnings(target) {
        matchData.innings = 2;
        matchData.currentOver = [];
        document.getElementById("innings-indicator").textContent = "2nd Innings";
        const matchResult = document.getElementById("match-result");
        matchResult.textContent = `1st Innings Complete - Target: ${target + 1}`;
        matchResult.classList.remove("hidden");
        setTimeout(() => {
          matchResult.classList.add("hidden");
        }, 3000);
        updateCurrentOverDisplay();
        updateOverHistoryDisplay();
        updateScoreDisplay();
      }

      // Function to add a ball to the current over
      function addBall(ballData) {
        const currentInnings = matchData.currentInningsData();
        matchData.currentOver.push(ballData);
        matchData.ballHistory.push(ballData);
        currentInnings.runs += ballData.runs;

        if (!ballData.isExtra) {
            currentInnings.balls++;
            if (currentInnings.balls >= 6) {
                startNewOver();
            }
        }

        if (ballData.isWicket) {
          currentInnings.wickets++;
        }

        if (currentInnings.wickets >= matchData.maxWickets && matchData.innings === 1) {
          switchToSecondInnings(currentInnings.runs);
          return;
        }

        const totalOversCompleted = currentInnings.overs + currentInnings.balls / 6;
        if (totalOversCompleted >= matchData.maxOvers && matchData.innings === 1) {
          switchToSecondInnings(currentInnings.runs);
          return;
        }

        updateCurrentOverDisplay();
        updateScoreDisplay();
      }

      // Function to update the current over display
      function updateCurrentOverDisplay() {
        const currentOverContainer = document.getElementById("current-over-balls");
        currentOverContainer.innerHTML = "";
        let currentOverRuns = 0;
        matchData.currentOver.forEach((ball) => {
          const ballElement = document.createElement("div");
          ballElement.className = "ball-indicator";
          if (ball.isWicket) {
            ballElement.classList.add("bg-primary", "text-white");
            ballElement.textContent = "W";
          } else if (ball.isExtra) {
            ballElement.classList.add("bg-red-100", "text-red-700");
            if (ball.extraType === "wd") {
                ballElement.textContent = ball.runs > 1 ? `Wd+${ball.runs - 1}` : "Wd";
                } else if (ball.extraType === "nb") {
                ballElement.textContent = ball.runs > 1 ? `Nb+${ball.runs - 1}` : "Nb";
                }
          } else {
            ballElement.classList.add("bg-gray-100", "text-gray-700");
            ballElement.textContent = ball.runs;
          }
          currentOverContainer.appendChild(ballElement);
          currentOverRuns += ball.runs;
        });
        document.getElementById("current-over-runs").textContent = currentOverRuns;
      }
      // Function to start a new over
      function startNewOver() {
        if (matchData.currentInningsData().balls < 6) {
          return; // Cannot start new over until current is complete
        }
        // Add current over to history
        const currentInnings = matchData.currentInningsData();
        currentInnings.overHistory.push([...matchData.currentOver]);
        // Reset current over
        matchData.currentOver = [];
        // Increment overs and reset balls
        currentInnings.overs++;
        currentInnings.balls = 0;
        // Check if innings should end
        if (currentInnings.overs >= matchData.maxOvers && matchData.innings === 1) {
          // Automatically switch to second innings
          matchData.innings = 2;
          matchData.currentOver = [];
          document.getElementById("innings-indicator").textContent = "2nd Innings";
          // Show transition message
          const matchResult = document.getElementById("match-result");
          matchResult.textContent = `1st Innings Complete - Target: ${currentInnings.runs + 1}`;
          matchResult.classList.remove("hidden");
          setTimeout(() => {
            matchResult.classList.add("hidden");
          }, 3000);
        }
        // Update over history display
        updateOverHistoryDisplay();
        // Update current over display
        updateCurrentOverDisplay();
        // Update main score display
        updateScoreDisplay();
        // Disable new over button
        //document.getElementById("new-over-btn").disabled = true;
      }
      // Function to update the over history display
      function updateOverHistoryDisplay() {
        const overHistoryContainer = document.getElementById("over-history");
        overHistoryContainer.innerHTML = "";
        const currentInnings = matchData.currentInningsData();
        // Display overs in reverse order (newest first)
        for (let i = currentInnings.overHistory.length - 1; i >= 0; i--) {
          const over = currentInnings.overHistory[i];
          const overNumber = i + 1;
          // Calculate over summary
          let overRuns = 0;
          let overWickets = 0;
          over.forEach((ball) => {
            overRuns += ball.runs;
            if (ball.isWicket) overWickets++;
          });
          // Create over element
          const overElement = document.createElement("div");
          overElement.className =
            "border border-gray-200 rounded-lg overflow-hidden";
          // Create over header
          const overHeader = document.createElement("div");
          overHeader.className =
            "flex justify-between items-center bg-gray-50 px-4 py-2 cursor-pointer";
          overHeader.dataset.over = overNumber;
          const overTitle = document.createElement("div");
          overTitle.className = "font-medium";
          overTitle.textContent = `Over ${overNumber}`;
          const overSummary = document.createElement("div");
          overSummary.className = "flex items-center";
          const summaryText = document.createElement("span");
          summaryText.className = "text-gray-700 mr-3";
          summaryText.textContent = `${overRuns} runs${overWickets > 0 ? `, ${overWickets} wicket${overWickets > 1 ? "s" : ""}` : ""}`;
          const expandIcon = document.createElement("i");
          expandIcon.className = "ri-arrow-down-s-line";
          overSummary.appendChild(summaryText);
          overSummary.appendChild(expandIcon);
          overHeader.appendChild(overTitle);
          overHeader.appendChild(overSummary);
          // Create over details
          const overDetails = document.createElement("div");
          overDetails.className = "p-3 border-t border-gray-200";
          const ballsContainer = document.createElement("div");
          ballsContainer.className = "flex flex-wrap gap-2";
          over.forEach((ball) => {
            const ballElement = document.createElement("div");
            ballElement.className = "ball-indicator";
            if (ball.isWicket) {
              ballElement.classList.add("bg-primary", "text-white");
              ballElement.textContent = "W";
            } else if (ball.isExtra) {
              ballElement.classList.add("bg-red-100", "text-red-700");
              if (ball.extraType === "wd") {
                ballElement.textContent = ball.runs > 1 ? `Wd+${ball.runs - 1}` : "Wd";
                } else if (ball.extraType === "nb") {
                ballElement.textContent = ball.runs > 1 ? `Nb+${ball.runs - 1}` : "Nb";
                }
            } else {
              ballElement.classList.add("bg-gray-100", "text-gray-700");
              ballElement.textContent = ball.runs;
            }
            ballsContainer.appendChild(ballElement);
          });
          overDetails.appendChild(ballsContainer);
          // Assemble over element
          overElement.appendChild(overHeader);
          overElement.appendChild(overDetails);
          overHistoryContainer.appendChild(overElement);
          // Add toggle functionality
          overHeader.addEventListener("click", function () {
            const details = this.nextElementSibling;
            const arrow = this.querySelector("i");
            if (details.style.display === "none") {
              details.style.display = "block";
              arrow.className = "ri-arrow-down-s-line";
            } else {
              details.style.display = "none";
              arrow.className = "ri-arrow-right-s-line";
            }
          });
        }
      }
      // Function to undo the last ball
      function undoLastBall() 
      {
        if (matchData.isMatchEnded) return;
        if (matchData.ballHistory.length === 0) return;

        const lastBall = matchData.ballHistory.pop();
        const currentInnings = matchData.currentInningsData();

        matchData.currentOver.pop();
        currentInnings.runs -= lastBall.runs;

        if (!lastBall.isExtra || (lastBall.isExtra && lastBall.extraType === "nb"))
        {
          currentInnings.balls--;

          if (currentInnings.balls < 0) {
            if (currentInnings.overs > 0) {
              currentInnings.overs--;
              currentInnings.balls = 5; 

              if (currentInnings.overHistory.length > 0) {
                matchData.currentOver = currentInnings.overHistory.pop();
              }
            } else {
              currentInnings.balls = 0; // Can't go below 0
            }
          }
        }
        // Revert wickets
        if (lastBall.isWicket) {
          currentInnings.wickets--;
        }
        // Update displays
        updateCurrentOverDisplay();
        updateOverHistoryDisplay();
        updateScoreDisplay();
      }
      // Event listeners for run buttons
      document.querySelectorAll(".run-btn").forEach((button) => {
        button.addEventListener("click", function () {
          const runs = parseInt(this.dataset.run);
          addBall({
            runs: runs,
            isExtra: false,
            isWicket: false,
          });
        });
      });
      // Event listener for wide button
      document.getElementById("wide-btn").addEventListener("click", function () {
        // Show extra runs modal
        document.getElementById("extra-runs-modal").classList.remove("hidden");
        document.getElementById("extra-runs-title").textContent = "Wide Ball - Extra Runs";
        document.getElementById("extra-runs-input").value = 1; // Default 1 run for wide
        // Store the extra type for the confirm button
        document.getElementById("confirm-extra").dataset.extraType = "wd";
      });
      // Event listener for no ball button
      document.getElementById("no-ball-btn").addEventListener("click", function () {
        // Show extra runs modal
        document.getElementById("extra-runs-modal").classList.remove("hidden");
        document.getElementById("extra-runs-title").textContent = "No Ball - Extra Runs";
        document.getElementById("extra-runs-input").value = 1; // Default 1 run for no ball
        // Store the extra type for the confirm button
        document.getElementById("confirm-extra").dataset.extraType = "nb";
      });
      // Event listener for wicket button
      document.getElementById("wicket-btn").addEventListener("click", function () {
        // Show wicket modal
        document.getElementById("wicket-modal").classList.remove("hidden");
      });
      // Event listeners for extra runs modal
      document
        .getElementById("decrease-extra")
        .addEventListener("click", function () {
          const input = document.getElementById("extra-runs-input");
          const currentValue = parseInt(input.value);
          if (currentValue > 0) {
            input.value = currentValue - 1;
          }
        });
      document
        .getElementById("increase-extra")
        .addEventListener("click", function () {
          const input = document.getElementById("extra-runs-input");
          const currentValue = parseInt(input.value) || 0;
          if (currentValue < 6) {
            input.value = currentValue + 1;
          } else {
            input.value = 6;
          }
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });
      document
        .getElementById("cancel-extra")
        .addEventListener("click", function () {
          document.getElementById("extra-runs-modal").classList.add("hidden");
        });
      document
        .getElementById("confirm-extra")
        .addEventListener("click", function () {
          const extraRuns = parseInt(
            document.getElementById("extra-runs-input").value,
          );
          const extraType = this.dataset.extraType;
          addBall({
            runs: extraRuns,
            isExtra: true,
            extraType: extraType,
            isWicket: false,
          });
          document.getElementById("extra-runs-modal").classList.add("hidden");
        });
      // Event listeners for wicket modal
      document
        .getElementById("decrease-wicket-runs")
        .addEventListener("click", function () {
          const input = document.getElementById("wicket-runs-input");
          const currentValue = parseInt(input.value);
          if (currentValue > 0) {
            input.value = currentValue - 1;
          }
        });
      document
        .getElementById("increase-wicket-runs")
        .addEventListener("click", function () {
          const input = document.getElementById("wicket-runs-input");
          const currentValue = parseInt(input.value);
          if (currentValue < 6) {
            input.value = currentValue + 1;
          }
        });
      document
        .getElementById("cancel-wicket")
        .addEventListener("click", function () {
          document.getElementById("wicket-modal").classList.add("hidden");
        });
      document
        .getElementById("confirm-wicket")
        .addEventListener("click", function () {
          const wicketRuns = parseInt(
            document.getElementById("wicket-runs-input").value,
          );
          const dismissalType = document.getElementById("dismissal-type").value;
          addBall({
            runs: wicketRuns,
            isWicket: true,
            dismissalType: dismissalType,
            isExtra: false,
          });
          document.getElementById("wicket-modal").classList.add("hidden");
        });

      document.getElementById("new-over-btn").addEventListener("click", function () {
        window.location.reload();
      });

      // Event listener for undo button
      document.getElementById("undo-btn").addEventListener("click", function () {
        document.getElementById("undo-confirm-modal").classList.remove("hidden");
      });
      // Event listeners for undo confirmation modal
      document.getElementById("cancel-undo").addEventListener("click", function () {
        document.getElementById("undo-confirm-modal").classList.add("hidden");
      });
      document
        .getElementById("confirm-undo")
        .addEventListener("click", function () {
          document.getElementById("undo-confirm-modal").classList.add("hidden");
          undoLastBall();
        });
      // Event listener for switch innings button
      document
        .getElementById("switch-innings")
        .addEventListener("click", function () {
          if (matchData.innings === 1) {
            // Switch to second innings
            matchData.innings = 2;
            // Reset current over
            matchData.currentOver = [];
            // Update displays
            updateCurrentOverDisplay();
            updateOverHistoryDisplay();
            updateScoreDisplay();
          } else {
            // Switch back to first innings
            matchData.innings = 1;
            // Reset current over
            matchData.currentOver = [];
            // Update displays
            updateCurrentOverDisplay();
            updateOverHistoryDisplay();
            updateScoreDisplay();
          }
        });
      // Event listeners for max overs and wickets inputs
      document
        .getElementById("total-overs-input")
        .addEventListener("change", function () {
          matchData.maxOvers = parseInt(this.value);
          updateScoreDisplay();
        });
      document
        .getElementById("max-wickets-input")
        .addEventListener("change", function () {
          matchData.maxWickets = parseInt(this.value);
          updateScoreDisplay();
        });
      // Initialize over history display
      updateOverHistoryDisplay();

      function showMatchEndMessage(winningTeam, byText) {
        matchData.isMatchEnded = true;
        const modal = document.getElementById("match-end-modal");
        const message = document.getElementById("match-end-message");
        message.textContent = `${winningTeam} won by ${byText}!`;
        modal.classList.remove("hidden");

        disableAllInputs();
      }

      function disableAllInputs() {
        document.querySelectorAll("button.run-btn, button.action-btn").forEach((btn) => {
          btn.disabled = true;
          btn.classList.add("opacity-50", "cursor-not-allowed");
        });

        document.getElementById("undo-btn").disabled = true;
        document.getElementById("undo-btn").classList.add("opacity-50", "cursor-not-allowed");
      }

      document.getElementById("close-match-end-modal").addEventListener("click", function () {
        document.getElementById("match-end-modal").classList.add("hidden");
      });
    });
