export var SessionStatus;
(function (SessionStatus) {
    SessionStatus["INITIALIZING"] = "initializing";
    SessionStatus["ACTIVE"] = "active";
    SessionStatus["PAUSED"] = "paused";
    SessionStatus["COMPLETED"] = "completed";
    SessionStatus["CANCELLED"] = "cancelled";
})(SessionStatus || (SessionStatus = {}));
export var SessionPhase;
(function (SessionPhase) {
    SessionPhase["BRIEF"] = "brief";
    SessionPhase["INITIALIZE_AGENTS"] = "initialize_agents";
    SessionPhase["GENERATE_IDEAS"] = "generate_ideas";
    SessionPhase["INDEPENDENT_REVIEW"] = "independent_review";
    SessionPhase["TOURNAMENT"] = "tournament";
    SessionPhase["FINAL_DECISION"] = "final_decision";
})(SessionPhase || (SessionPhase = {}));
//# sourceMappingURL=session.types.js.map