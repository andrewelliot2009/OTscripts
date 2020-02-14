UI.AddLabel("______________________________________");
UI.AddLabel("Team-Based Chams")
UI.AddColorPicker("CT Visible");
UI.AddColorPicker("CT Hidden");
UI.AddColorPicker("T Visible");
UI.AddColorPicker("T Hidden");
UI.AddLabel("______________________________________");
//Variables
var ctv = UI.GetColor("Script items", "CT Visible");
var cth = UI.GetColor("Script items", "CT Hidden");
var tv = UI.GetColor("Script items", "T Visible");
var th = UI.GetColor("Script items", "T Hidden");
var team = Entity.GetProp(Entity.GetLocalPlayer(),"DT_BaseEntity", "m_iTeamNum")
function onFSN(){
    if(Cheat.FrameStage() != 2)
        return
    if(team == 2){ // T
	    UI.SetValue("Visual", "ENEMIES", "Chams", "Visible", "Visible override", true);
	    UI.SetValue("Visual", "ENEMIES", "Chams", "XQZ", "Hidden override", true);
		UI.SetValue("Visual", "ENEMIES", "ESP", "Name", true);
		UI.SetColor("Visual", "ENEMIES", "ESP", "Name", ctv);
		UI.SetValue("Visual", "ENEMIES", "ESP", "Health", true);
		UI.SetValue("Visual", "ENEMIES", "ESP", "Health color override", true);
		UI.SetColor("Visual", "ENEMIES", "ESP", "Health color override", ctv);
        UI.SetColor("Visual", "ENEMIES", "Chams", "Visible", "Visible Color", ctv);
		UI.SetColor("Visual", "ENEMIES", "Chams", "XQZ", "Hidden Color", cth);
		UI.SetValue("Visual", "FRIENDLIES", "ESP", "Name", true);
		UI.SetColor("Visual", "FRIENDLIES", "ESP", "Name", tv);
		UI.SetValue("Visual", "FRIENDLIES", "ESP", "Health", true);
		UI.SetValue("Visual", "FRIENDLIES", "ESP", "Health color override", true);
		UI.SetColor("Visual", "FRIENDLIES", "ESP", "Health color override", tv);
		UI.SetColor("Visual", "FRIENDLIES", "Chams", "Visible", "Visible Color", tv)
		UI.SetColor("Visual", "FRIENDLIES", "Chams", "XQZ", "Hidden Color", th);;
	}
    else if(team == 3){ // CT
	    UI.SetValue("Visual", "ENEMIES", "Chams", "Visible", "Visible override", true);
	    UI.SetValue("Visual", "ENEMIES", "Chams", "XQZ", "Hidden override", true);
		UI.SetValue("Visual", "ENEMIES", "ESP", "Name", true);
		UI.SetColor("Visual", "ENEMIES", "ESP", "Name", tv);
		UI.SetValue("Visual", "ENEMIES", "ESP", "Health", true);
		UI.SetValue("Visual", "ENEMIES", "ESP", "Health color override", true);
		UI.SetColor("Visual", "ENEMIES", "ESP", "Health color override", tv);
        UI.SetColor("Visual", "ENEMIES", "Chams", "Visible", "Visible Color", tv);
		UI.SetColor("Visual", "ENEMIES", "Chams", "XQZ", "Hidden Color", th);
		UI.SetValue("Visual", "FRIENDLIES", "ESP", "Name", true);
		UI.SetColor("Visual", "FRIENDLIES", "ESP", "Name", ctv);
		UI.SetValue("Visual", "FRIENDLIES", "ESP", "Health", true);
		UI.SetValue("Visual", "FRIENDLIES", "ESP", "Health color override", true);
		UI.SetColor("Visual", "FRIENDLIES", "ESP", "Health color override", ctv);
		UI.SetColor("Visual", "FRIENDLIES", "Chams", "Visible", "Visible Color", ctv)
		UI.SetColor("Visual", "FRIENDLIES", "Chams", "XQZ", "Hidden Color", cth);;
    }
}
Cheat.RegisterCallback("FrameStageNotify","onFSN")