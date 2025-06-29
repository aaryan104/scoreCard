document.addEventListener("DOMContentLoaded", function () {
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

      matchData.maxOvers = parseInt(document.getElementById("total-overs-input").value || "10");
      matchData.maxWickets = parseInt(document.getElementById("max-wickets-input").value || "10");
      matchData.firstInnings.runs = 0;
      matchData.firstInnings.wickets = 0;
      matchData.firstInnings.overs = 0;
      matchData.firstInnings.balls = 0;

      updateScoreDisplay();

      function updateScoreDisplay() {
        const currentInnings = matchData.currentInningsData();

        document.getElementById("total-runs").textContent = currentInnings.runs;
        document.getElementById("total-wickets").textContent = currentInnings.wickets;
        document.getElementById("total-overs").textContent = currentInnings.overs;
        document.getElementById("current-balls").textContent = currentInnings.balls;
        document.getElementById("innings-indicator").textContent = matchData.innings === 1 ? "1st Innings" : "2nd Innings";

        if (matchData.innings === 1) 
        {
          document.getElementById("first-innings-info").classList.remove("hidden");
          document.getElementById("second-innings-info").classList.add("hidden");

          const totalOvers = currentInnings.overs + currentInnings.balls / 6;
          const runRate = totalOvers > 0 ? (currentInnings.runs / totalOvers).toFixed(2) : "0.00";
          document.getElementById("current-run-rate").textContent = runRate;

          const remainingOvers = matchData.maxOvers - totalOvers;
          const projectedScore = Math.round(
            currentInnings.runs + remainingOvers * parseFloat(runRate),
          );
          document.getElementById("projected-score").textContent = projectedScore;
        } 
        else 
        {
          document.getElementById("first-innings-info").classList.add("hidden");
          document.getElementById("second-innings-info").classList.remove("hidden");

          const runsRequired = matchData.firstInnings.runs + 1 - currentInnings.runs;
          const ballsRemaining = matchData.maxOvers * 6 - (currentInnings.overs * 6 + currentInnings.balls);
          document.getElementById("runs-required").textContent = Math.max(0, runsRequired, );
          document.getElementById("balls-remaining").textContent = ballsRemaining;

          const reqRunRate = ballsRemaining > 0 ? ((runsRequired * 6) / ballsRemaining).toFixed(2) : "0.00";
          document.getElementById("req-run-rate").textContent = reqRunRate;
          
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
      }

      function switchToSecondInnings(target) 
      {
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

      function addBall(ballData) 
      {
        const currentInnings = matchData.currentInningsData();
        matchData.currentOver.push(ballData);
        matchData.ballHistory.push(ballData);
        currentInnings.runs += ballData.runs;

        if (!ballData.isExtra) 
        {
          currentInnings.balls++;
          if (currentInnings.balls >= 6) 
          {
              startNewOver();
          }
        }

        if (ballData.isWicket) 
        {
          currentInnings.wickets++;
        }

        if (currentInnings.wickets >= matchData.maxWickets && matchData.innings === 1) 
        {
          switchToSecondInnings(currentInnings.runs);
          return;
        }

        const totalOversCompleted = currentInnings.overs + currentInnings.balls / 6;
        if (totalOversCompleted >= matchData.maxOvers && matchData.innings === 1) 
        {
          switchToSecondInnings(currentInnings.runs);
          return;
        }

        updateCurrentOverDisplay();
        updateScoreDisplay();
      }

      function updateCurrentOverDisplay() 
      {
        const currentOverContainer = document.getElementById("current-over-balls");
        currentOverContainer.innerHTML = "";
        let currentOverRuns = 0;
       
        matchData.currentOver.forEach((ball) => {
          const ballElement = document.createElement("div");
          ballElement.className = "ball-indicator";
          
          if (ball.isWicket) 
          {
            ballElement.classList.add("bg-primary", "text-white");
            ballElement.textContent = "W";
          } 
          else if (ball.isExtra) 
          {
            ballElement.classList.add("bg-red-100", "text-red-700");
            if (ball.extraType === "wd") 
            {
              ballElement.textContent = ball.runs > 1 ? `Wd+${ball.runs - 1}` : "Wd";
            } 
            else if (ball.extraType === "nb") 
            {
              ballElement.textContent = ball.runs > 1 ? `Nb+${ball.runs - 1}` : "Nb";
            }
          } 
          else 
          {
            ballElement.classList.add("bg-gray-100", "text-gray-700");
            ballElement.textContent = ball.runs;
          }
          currentOverContainer.appendChild(ballElement);
          currentOverRuns += ball.runs;
        });
        document.getElementById("current-over-runs").textContent = currentOverRuns;
      }

      function startNewOver() 
      {
        if (matchData.currentInningsData().balls < 6) 
        {
          return; // Cannot start new over until current is complete
        }

        const currentInnings = matchData.currentInningsData();
        currentInnings.overHistory.push([...matchData.currentOver]);

        matchData.currentOver = [];

        currentInnings.overs++;
        currentInnings.balls = 0;

        if (currentInnings.overs >= matchData.maxOvers && matchData.innings === 1) 
        {
          matchData.innings = 2;
          matchData.currentOver = [];
          document.getElementById("innings-indicator").textContent = "2nd Innings";

          const matchResult = document.getElementById("match-result");
          matchResult.textContent = `1st Innings Complete - Target: ${currentInnings.runs + 1}`;
          matchResult.classList.remove("hidden");

          setTimeout(() => {
            matchResult.classList.add("hidden");
          }, 3000);
        }

        updateOverHistoryDisplay();
        updateCurrentOverDisplay();
        updateScoreDisplay();
      }

      function updateOverHistoryDisplay() 
      {
        const overHistoryContainer = document.getElementById("over-history");
        overHistoryContainer.innerHTML = "";
        const currentInnings = matchData.currentInningsData();

        for (let i = currentInnings.overHistory.length - 1; i >= 0; i--) 
        {
          const over = currentInnings.overHistory[i];
          const overNumber = i + 1;

          let overRuns = 0;
          let overWickets = 0;

          over.forEach((ball) => {
            overRuns += ball.runs;
            if (ball.isWicket) overWickets++;
          });

          const overElement = document.createElement("div");
          overElement.className = "border border-gray-200 rounded-lg overflow-hidden";

          const overHeader = document.createElement("div");
          overHeader.className = "flex justify-between items-center bg-gray-50 px-4 py-2 cursor-pointer";
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

          const overDetails = document.createElement("div");
          overDetails.className = "p-3 border-t border-gray-200";

          const ballsContainer = document.createElement("div");
          ballsContainer.className = "flex flex-wrap gap-2";

          over.forEach((ball) => {
            const ballElement = document.createElement("div");
            ballElement.className = "ball-indicator";
            
            if (ball.isWicket) 
            {
              ballElement.classList.add("bg-primary", "text-white");
              ballElement.textContent = "W";
            }
            else if (ball.isExtra) 
            {
              ballElement.classList.add("bg-red-100", "text-red-700");
              if (ball.extraType === "wd") 
              {
                ballElement.textContent = ball.runs > 1 ? `Wd+${ball.runs - 1}` : "Wd";
              }
              else if (ball.extraType === "nb") 
              {
                ballElement.textContent = ball.runs > 1 ? `Nb+${ball.runs - 1}` : "Nb";
              }
            } 
            else 
            {
              ballElement.classList.add("bg-gray-100", "text-gray-700");
              ballElement.textContent = ball.runs;
            }
            ballsContainer.appendChild(ballElement);
          });
          overDetails.appendChild(ballsContainer);

          overElement.appendChild(overHeader);
          overElement.appendChild(overDetails);
          overHistoryContainer.appendChild(overElement);

          overHeader.addEventListener("click", function () 
          {
            const details = this.nextElementSibling;
            const arrow = this.querySelector("i");
          
            if (details.style.display === "none") 
            {
              details.style.display = "block";
              arrow.className = "ri-arrow-down-s-line";
            } 
            else 
            {
              details.style.display = "none";
              arrow.className = "ri-arrow-right-s-line";
            }
          });
        }
      }

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

          if (currentInnings.balls < 0) 
          {
            if (currentInnings.overs > 0) 
            {
              currentInnings.overs--;
              currentInnings.balls = 5; 

              if (currentInnings.overHistory.length > 0) 
              {
                matchData.currentOver = currentInnings.overHistory.pop();
              }
            } 
            else 
            {
              currentInnings.balls = 0; // Can't go below 0
            }
          }
        }

        if (lastBall.isWicket) 
        {
          currentInnings.wickets--;
        }

        updateCurrentOverDisplay();
        updateOverHistoryDisplay();
        updateScoreDisplay();
      }

      document.querySelectorAll(".run-btn").forEach((button) => {
        button.addEventListener("click", function () 
        {
          const runs = parseInt(this.dataset.run);
          addBall({
            runs: runs,
            isExtra: false,
            isWicket: false,
          });
        });
      });

      document.getElementById("wide-btn").addEventListener("click", function () 
      {
        document.getElementById("extra-runs-modal").classList.remove("hidden");
        document.getElementById("extra-runs-title").textContent = "Wide Ball - Extra Runs";
        document.getElementById("extra-runs-input").value = 1; // Default 1 run for wide
        document.getElementById("confirm-extra").dataset.extraType = "wd";
      });

      document.getElementById("no-ball-btn").addEventListener("click", function () 
      {
        document.getElementById("extra-runs-modal").classList.remove("hidden");
        document.getElementById("extra-runs-title").textContent = "No Ball - Extra Runs";
        document.getElementById("extra-runs-input").value = 1; // Default 1 run for no ball
        document.getElementById("confirm-extra").dataset.extraType = "nb";
      });

      document.getElementById("wicket-btn").addEventListener("click", function () 
      {
        document.getElementById("wicket-modal").classList.remove("hidden");
      });

      document.getElementById("decrease-extra").addEventListener("click", function () 
      {
        const input = document.getElementById("extra-runs-input");
        const currentValue = parseInt(input.value);
        if (currentValue > 0) 
        {
          input.value = currentValue - 1;
        }
      });
      
      document.getElementById("increase-extra").addEventListener("click", function () 
      {
        const input = document.getElementById("extra-runs-input");
        const currentValue = parseInt(input.value) || 0;
        if (currentValue < 6) 
        {
          input.value = currentValue + 1;
        } 
        else 
        {
          input.value = 6;
        }
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });

      document.getElementById("cancel-extra").addEventListener("click", function () 
      {
        document.getElementById("extra-runs-modal").classList.add("hidden");
      });

      document.getElementById("confirm-extra").addEventListener("click", function () 
      {
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

      document.getElementById("decrease-wicket-runs").addEventListener("click", function () 
      {
        const input = document.getElementById("wicket-runs-input");
        const currentValue = parseInt(input.value);
        if (currentValue > 0) 
        {
          input.value = currentValue - 1;
        }
      });
      
      document.getElementById("increase-wicket-runs").addEventListener("click", function () 
      {
        const input = document.getElementById("wicket-runs-input");
        const currentValue = parseInt(input.value);
        if (currentValue < 6) 
        {
          input.value = currentValue + 1;
        }
      });
      
      document.getElementById("cancel-wicket").addEventListener("click", function () 
      {
        document.getElementById("wicket-modal").classList.add("hidden");
      });

      document.getElementById("confirm-wicket").addEventListener("click", function () 
      {
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

      document.getElementById("new-over-btn").addEventListener("click", function () 
      {
        window.location.reload();
      });

      document.getElementById("undo-btn").addEventListener("click", function () 
      {
        document.getElementById("undo-confirm-modal").classList.remove("hidden");
      });

      document.getElementById("cancel-undo").addEventListener("click", function () 
      {
        document.getElementById("undo-confirm-modal").classList.add("hidden");
      });
      
      document.getElementById("confirm-undo").addEventListener("click", function () 
      {
        document.getElementById("undo-confirm-modal").classList.add("hidden");
        undoLastBall();
      });

      document.getElementById("switch-innings").addEventListener("click", function () 
      {
        if (matchData.innings === 1) 
        {
          matchData.innings = 2;
          matchData.currentOver = [];

          updateCurrentOverDisplay();
          updateOverHistoryDisplay();
          updateScoreDisplay();
        }
        else 
        {
          matchData.innings = 1;
          matchData.currentOver = [];

          updateCurrentOverDisplay();
          updateOverHistoryDisplay();
          updateScoreDisplay();
        }
      });

      document.getElementById("total-overs-input").addEventListener("change", function () 
      {
        matchData.maxOvers = parseInt(this.value);
        updateScoreDisplay();
      });
    
      document.getElementById("max-wickets-input").addEventListener("change", function () 
      {
        matchData.maxWickets = parseInt(this.value);
        updateScoreDisplay();
      });

      updateOverHistoryDisplay();

      function showMatchEndMessage(winningTeam, byText) 
      {
        matchData.isMatchEnded = true;
        const modal = document.getElementById("match-end-modal");
        const message = document.getElementById("match-end-message");
        message.textContent = `${winningTeam} won by ${byText}!`;
        modal.classList.remove("hidden");

        disableAllInputs();
      }

      function disableAllInputs() 
      {
        document.querySelectorAll("button.run-btn, button.action-btn").forEach((btn) => {
          btn.disabled = true;
          btn.classList.add("opacity-50", "cursor-not-allowed");
        });

        document.getElementById("undo-btn").disabled = true;
        document.getElementById("undo-btn").classList.add("opacity-50", "cursor-not-allowed");
      }

      document.getElementById("close-match-end-modal").addEventListener("click", function () 
      {
        document.getElementById("match-end-modal").classList.add("hidden");
      });

      function updateDateTime() 
      {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const time = now.toLocaleTimeString('en-IN', { hour12: false });
        document.getElementById("live-date").textContent = now.toLocaleDateString('en-IN', options);
        document.getElementById("live-time").textContent = time;
      }
      setInterval(updateDateTime, 1000);
      updateDateTime();
    });
