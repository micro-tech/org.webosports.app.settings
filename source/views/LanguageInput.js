enyo.kind({
	name: "LanguageInput",
	kind: "enyo.Control",
	layoutKind: "FittableRowsLayout",
	palm: true,
	keyboardState: {},
	components: [
		{kind: "onyx.Toolbar", style: "line-height: 36px;", components: [
			{content: "Language & Input"}
		]},
		{kind: "Scroller", touch: true, horizontal: "hidden", fit: true, components: [
			{name: "div", tag: "div", style: "padding: 35px 10% 35px 10%;", fit: true, components: [
				{kind: "onyx.Groupbox", components: [
					{kind: "onyx.GroupboxHeader", content: "Input"},
					{kind: "enyo.FittableColumns", classes: "group-item", style: "padding-top: 10px;", components: [
						{kind: "Control", content: "Auto capitalization", style: "padding-top: 10px;"},
						{kind: "onyx.TooltipDecorator", fit: true, style:  "padding-top: 10px;", components: [
							{name: "AutoCapitalization", kind: "onyx.ToggleButton", style: "float: right;", onChange: "onInputPreferenceChanged"},
							{kind: "onyx.Tooltip", content: "Auto Capitaliztion"}
						]},
					]},
					{kind: "enyo.FittableColumns", classes: "group-item", components: [
						{kind: "Control", content: "Auto completion", style: "padding-top: 10px; "},
						{kind: "onyx.TooltipDecorator", fit: true, style:  "padding-top: 10px;", components: [
							{name: "AutoCompletion", kind: "onyx.ToggleButton", style: "float: right;", onChange: "onInputPreferenceChanged"},
							{kind: "onyx.Tooltip", content: "Auto Completion"}
						]}
					]},
					{kind: "enyo.FittableColumns", classes: "group-item", components: [
						{kind: "Control", content: "Predictive text", style: "padding-top: 10px; "},
						{kind: "onyx.TooltipDecorator", fit: true, style:  "padding-top: 10px;", components: [
							{name: "PredictiveText", kind: "onyx.ToggleButton", style: "float: right;", onChange: "onInputPreferenceChanged"},
							{kind: "onyx.Tooltip", content: "Predictive Text"}
						]}
					]},
					{kind: "enyo.FittableColumns", classes: "group-item", components: [
						{kind: "Control", content: "Spell checking", style: "padding-top: 10px; "},
						{kind: "onyx.TooltipDecorator", fit: true, style:  "padding-top: 10px;", components: [
							{name: "SpellChecking", kind: "onyx.ToggleButton", style: "float: right;", onChange: "onInputPreferenceChanged"},
							{kind: "onyx.Tooltip", content: "Spell Checking"}
						]}
					]},
					{kind: "enyo.FittableColumns", classes: "group-item", components: [
						{kind: "Control", content: "Key press feedback", style: "padding-top: 10px; "},
						{kind: "onyx.TooltipDecorator", fit: true, style:  "padding-top: 10px;", components: [
							{name: "KeyPressFeedback", kind: "onyx.ToggleButton", style: "float: right;", onChange: "onInputPreferenceChanged"},
							{kind: "onyx.Tooltip", content: "Key Press FeedBack"}
						]}
					]}
				]}
			]}
		]},
		{kind: "onyx.Toolbar", components: [
			{name: "Grabber", kind: "onyx.Grabber"},
		]},
		{ name: "SetPreferences", kind: "enyo.PalmService", service: "palm://com.palm.systemservice", method: "setPreferences", subscribe: false,
          onComplete: "onSetPreferencesCompleted" },
        { name: "GetPreferences", kind: "enyo.PalmService", service: "palm://com.palm.systemservice", method: "getPreferences", subscribe: true,
          onComplete: "onGetPreferencesCompleted" }
	],
    // Handlers
    create: function(inSender, inEvent) {
        this.inherited(arguments);

        if (!window.PalmSystem) {
            enyo.log("Non-palm platform, service requests disabled.");
            this.palm = false;

            this.$.KeyPressFeedback.value = true;

            return;
        }

        console.log("Fetching preferences from system service");

        this.$.GetPreferences.send({keys:["keyboard"]});
    },
    reflow: function (inSender) {
        this.inherited(arguments);
        if (enyo.Panels.isScreenNarrow()){
            this.$.Grabber.applyStyle("visibility", "hidden");
            this.$.div.setStyle("padding: 35px 5% 35px 5%;");
        }else{
            this.$.Grabber.applyStyle("visibility", "visible");
        }
    },
    
    // Control Action Handlers
    onInputPreferenceChanged: function(inSender, inEvent) {
        enyo.log("Input preferences changed");
        if (!this.palm)
            return;
        this.$.SetPreferences.send({keyboard: {
            autoCompletion: this.$.AutoCompletion.getValue(),
            autoCapitalization: this.$.AutoCapitalization.getValue(),
            predictiveText: this.$.PredictiveText.getValue(),
            spellChecking: this.$.SpellChecking.getValue(),
            keyPressFeedback: this.$.KeyPressFeedback.getValue()
        }});
    },
    // Service Handlers
    onGetPreferencesCompleted: function(inSender, inEvent) {
        var response = inEvent.data;

        if (!response)
            return;

        console.log("Got response from system service: " + JSON.stringify(response));

        if (response.keyboard && response.keyboard !== this.keyboardState) {
            this.$.AutoCapitalization.value = response.keyboard.autoCapitalization;
            this.$.AutoCapitalization.updateVisualState();
            this.$.AutoCompletion.value = response.keyboard.autoCompletion;
            this.$.AutoCompletion.updateVisualState();
            this.$.PredictiveText.value = response.keyboard.predictiveText;
            this.$.PredictiveText.updateVisualState();
            this.$.SpellChecking.value = response.keyboard.spellChecking;
            this.$.SpellChecking.updateVisualState();
            this.$.KeyPressFeedback.value = response.keyboard.keyPressFeedback;
            this.$.KeyPressFeedback.updateVisualState();
            this.keyboardState = response.keyboard;
        }
    },
    onSetPreferencesCompleted: function(inSender, inEvent) {
        var response = inEvent.data;
        if (!response.returnValue)
            console.log("Failed to set keyboard preferences");
    },
});
