function on_player_death()
{
    var roasts = ['owned by my Glock(TM) Brand Glock-19','catch these fists', 'dude did i kill you with my decoy?', 'sus bro', 'you wanna try that again?', 'fallout boy sucks dick sum 41 gang', 'Stop trolling please', 'Whats your net worth retard','Get 1d bossman no suit no tie', 'Just toting this glizzy to the movies', 'Got that big iron on my hip', 'Buckets to tha rim fr fr', 'Ok Boogerbreath','Get dunked on','Let that sink in']
    var roast = roasts[Math.floor(Math.random()*roasts.length)];
    if ( UI.GetValue("MISC", "JAVASCRIPT", "Script Items", "Noob Dog Killsay" ) ) {
        attacker = Event.GetInt("attacker");
        attacker_index = Entity.GetEntityFromUserID(attacker);

    if (attacker_index == Entity.GetLocalPlayer())
    {
        Global.ExecuteCommand("say " + roast + "\n");
        }
    }
}
function on_player_death2()
{
    var roasts2 = ['blasto jajaja','yo tiene un perro con leche', 'haha LOL', 'xd roflcopter', 'uno 1 hHAHA', 'nice XD', 'fuego es caliente jajaja', 'you are much badness! ','surrender hermano, por favor', 'i throw decoy', 'that look hurt!', 'mexico beste hvher', 'bad hake XD nice 1', 'i just better:)','no spin pls papa']
    var roast2 = roasts2[Math.floor(Math.random()*roasts2.length)];
    if ( UI.GetValue("MISC", "JAVASCRIPT", "Script Items", "Killsay jajaja" ) ) {
        attacker = Event.GetInt("attacker");
        attacker_index = Entity.GetEntityFromUserID(attacker);

    if (attacker_index == Entity.GetLocalPlayer())
    {
        Global.ExecuteCommand("say " + roast2 + "\n");
        }
    }
}

var playing = false;
var started = 0.0

function ui(){
    if(GetScriptOption("Enable Custom Kill Voice")){
        UI.SetEnabled("Misc", "JAVASCRIPT", "Script Items", "Normal Kill", true);
        UI.SetEnabled("Misc", "JAVASCRIPT", "Script Items", "HS Sound", true);
    }else{
        UI.SetEnabled("Misc", "JAVASCRIPT", "Script Items", "Normal Kill", false);
        UI.SetEnabled("Misc", "JAVASCRIPT", "Script Items", "HS Sound", false);
    }

    if(GetScriptOption("HS Sound") && GetScriptOption("Enable Custom Kill Voice")){
        UI.SetEnabled("Misc", "JAVASCRIPT", "Script Items", "HS Kill", true);
    }
    else UI.SetEnabled("Misc", "JAVASCRIPT", "Script Items", "HS Kill", false);


function GetScriptOption(Name)
{
    var Value = UI.GetValue("Misc", "JAVASCRIPT", "Script Items", Name);
    return Value;
}

function PlayVoice()
{
    if (!GetScriptOption("Enable Custom Kill Voice")) return;
    if (Entity.GetEntityFromUserID(Event.GetInt("attacker")) !== Entity.GetLocalPlayer()) return;
    if (Entity.GetEntityFromUserID(Event.GetInt("userid")) == Entity.GetLocalPlayer()) return;
    if (UI.GetString("Misc", "JAVASCRIPT", "Script Items", "Button Sound Name").localeCompare("") == 0) return;

    started = Global.Realtime();
    playing = true;
    if (GetScriptOption("Loopback"))
    {
        Global.ExecuteCommand("voice_loopback 1");
    }

    if(Event.GetString("headshot").localeCompare("1") === 0 && GetScriptOption("Enable HS Sound") === 1){
        Sound.PlayMicrophone('C:\\Program Files (x86)\\Steam\\steamapps\\common\\Counter-Strike Global Offensive\\voice_input\\' + UI.GetString("Misc", "JAVASCRIPT", "Script Items", "HS Sound"));
    } else{
        Sound.PlayMicrophone('C:\\Program Files (x86)\\Steam\\steamapps\\common\\Counter-Strike Global Offensive\\voice_input\\' + UI.GetString("Misc", "JAVASCRIPT", "Script Items", "Normal Sound"));
    }

}


function Reset()
{
    if (playing && Math.abs(started + GetScriptOption("Sound Length") - Global.Realtime()) < 0.05)
    {
        playing = false;
        Sound.StopMicrophone();
        Global.ExecuteCommand("voice_loopback 0");
    }
}

Global.RegisterCallback("Draw", "ui");
Global.RegisterCallback("player_death", "PlayVoice");
Global.RegisterCallback("Draw", "playOnKey");
Global.RegisterCallback("FrameStageNotify", "Reset");
UI.AddSliderInt("", 0, 0);
UI.AddLabel("Andys Killsays");
UI.AddCheckbox("Enable Custom Kill Voice");
UI.AddTextbox("Normal Sound");
UI.AddCheckbox("Enable HS Sound");
UI.AddTextbox("HS Sound");
UI.AddCheckbox("Loopback");
UI.AddSliderFloat("Sound Length", 0.0, 10.0);
UI.AddSliderInt("", 0, 0);
UI.AddCheckbox("Noob Dog Killsay");
UI.AddSliderInt("", 0, 0);
UI.AddCheckbox("Killsay jajaja");
UI.AddSliderInt("", 0, 0);
