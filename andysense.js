
//Script compiled by Chrome#6707 for personal use. legitaa script got leaked so i decided to post
//Blockbot by Virakuroe
// UI
var UIOnKey = "[BB] Blockbot Targetting Key";
var UIDoBlock = "[BB] Blockbot On Key";
var UIMode = "[BB] Blockbot Mode";
var UIBHop = "[BB] Blockbot BHop Retreat";

var MODE_MATCH_SPEED = "Match Speed";
var MODE_MAX_SPEED = "Maximum Speed";

var blockbotModes = [
    MODE_MATCH_SPEED,
    MODE_MAX_SPEED
];

// Shared
var Target = null;
var CrouchBlock = false;
var LocalPlayer = null;
var NextVector = null;

// Less hard-baked stuff.
var types = {
    DEFAULT: "default",
    HOTKEY: "hotkey"
};

var entities = {
    CCSPlayer: 40
};

// Vector stuff
function print3(desc, vec) {
    Global.Print(desc + ": " + vec[0] + " | " + vec[1] + " | " + vec[2] + "\n");
}

function yaw3(v) {
    var x = v[0];
    var y = v[1];
    return Math.atan2(y, x) * 180 / Math.PI;
}

function dist3(a, b) {
    var ax = a[0];
    var ay = a[1];
    var az = a[2];
    var bx = b[0];
    var by = b[1];
    var bz = b[2];

    var dx = ax - bx;
    var dy = ay - by;
    var dz = az - bz;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function sub3(a, b) {
    var ax = a[0];
    var ay = a[1];
    var az = a[2];
    var bx = b[0];
    var by = b[1];
    var bz = b[2];

    return [ax - bx, ay - by, az - bz];
}

function add3(a, b) {
    var ax = a[0];
    var ay = a[1];
    var az = a[2];
    var bx = b[0];
    var by = b[1];
    var bz = b[2];

    return [ax + bx, ay + by, az + bz];
}

function len3(v) {
    return dist3(v, [0, 0, 0]);
}

// UI helpers
function getUIVal(name, type) {
    type = type || "default";
    var value = null;

    if (type == types.HOTKEY) {
        value = UI.IsHotkeyActive("Misc", "JAVASCRIPT", "Script Items", name);
    } else {
        value = UI.GetValue("Misc", "JAVASCRIPT", "Script Items", name);
    }

    return value;
}

function setUIVal(name, value, type) {
    if (type == types.HOTKEY) {
        return UI.ToggleHotkey("Misc", "JAVASCRIPT", "Script Items", name);
    }

    return UI.SetValue("Misc", "JAVASCRIPT", "Script Items", name, value);
}

// Helpers
// I would expect to get a single float out of m_vecVelocity[0] but it actually gives me the array.
function getEntityVelocity(entity) {
    return Entity.GetProp(entity, "CBasePlayer", "m_vecVelocity[0]"); // This actually resolves to a vec3 instead of the first float of the vec3
}

function degToRad(deg) {
    return deg * Math.PI / 180;
}

// blockbot.
function OnFrameMain() {
    LocalPlayer = Entity.GetLocalPlayer();

    if (!LocalPlayer) {
        return;
    }

    if (NextVector) {
        var screenCoords = Render.WorldToScreen(NextVector);
        Render.String(screenCoords[0] - (Render.TextSize("x")[0] / 2), screenCoords[1], 0, "x", [255, 0, 255, 255]);
    }

    if (Target && Entity.IsAlive(LocalPlayer) && Entity.IsAlive(Target)) {
        var NearPlayer_toScreen = Render.WorldToScreen(Entity.GetHitboxPosition(Target, 5));
        var targetHitboxPosition = Entity.GetHitboxPosition(Target, 0);
        var playerOrigin = Entity.GetRenderOrigin(LocalPlayer);
        var targetOrigin = Entity.GetRenderOrigin(Target);
        var color = null;

        if ((targetHitboxPosition[2] < playerOrigin[2]) && dist3(playerOrigin, targetOrigin) < 100) {
            CrouchBlock = true;
            color = [255, 255, 0, 255];
        } else {
            CrouchBlock = false;
            color = [255, 0, 0, 255];
        }

        if (NearPlayer_toScreen[0] != null && NearPlayer_toScreen[1] != null) {
            Render.String(NearPlayer_toScreen[0] - (Render.TextSize("x")[0] / 2), NearPlayer_toScreen[1], 0, "x", color);
        }
    }

    if (!getUIVal(UIOnKey, types.HOTKEY) || !Entity.IsAlive(LocalPlayer)) {
        //Global.Print( "Key not pressed or not alive; Bail...\n" );
        return;
    }

    if (getUIVal(UIOnKey, types.HOTKEY)) {
        //Global.Print( "No target selected, looking for victims...\n" );
        var cEntities = Entity.GetEntitiesByClassID(entities.CCSPlayer);

        for (var i = 0; i < cEntities.length; i++) {
            var cEntity = cEntities[i];

            if (cEntity != LocalPlayer && Entity.IsAlive(cEntity)) {
                if (!Target) {
                    Target = cEntity;
                    Global.PrintChat("Selected #" + Target + " - " + Entity.GetName(Target) + " as Target.\n");
                } else {
                    var playerOrigin = Entity.GetRenderOrigin(LocalPlayer);
                    var entityOrigin = Entity.GetRenderOrigin(cEntity);
                    var targetOrigin = Entity.GetRenderOrigin(Target);

                    if (dist3(playerOrigin, targetOrigin) > dist3(playerOrigin, entityOrigin)) {
                        // If entity is closer than target, use entity as target
                        Target = cEntity;
                        Global.PrintChat("Selected #" + Target + " - " + Entity.GetName(Target) + " as Target (closer than previous target).\n");
                    }
                }
            }
        }
    } else if (!getUIVal(UIOnKey, types.HOTKEY) || !Entity.IsAlive(Target)) {
        //Global.Print( "Key not pressed or target not alive; De-selecting...\n" );
        Target = null;
    }
}

function OnCreateMoveMain() {
    if (Target && getUIVal(UIDoBlock, types.HOTKEY)) {
        var LocalAngles = Global.GetViewAngles();
        var VecForward = sub3(Entity.GetRenderOrigin(Target), Entity.GetRenderOrigin(LocalPlayer));
        var otherYaw = yaw3(VecForward);
        var TargetSpeed = len3(getEntityVelocity(Target));

        if (CrouchBlock) {
            var cmdMove = [0, 0, 0];

            if (blockbotModes[getUIVal(UIMode)] == MODE_MATCH_SPEED) {
                cmdMove[0] = ((Math.sin(degToRad(LocalAngles[1])) * VecForward[1]) + (Math.cos(degToRad(LocalAngles[1])) * VecForward[0])) * 10;
                cmdMove[1] = ((Math.cos(degToRad(LocalAngles[1])) * -VecForward[1]) + (Math.sin(degToRad(LocalAngles[1])) * VecForward[0])) * 10;
            } else if (blockbotModes[getUIVal(UIMode)] == MODE_MAX_SPEED) {
                cmdMove[0] = ((Math.sin(degToRad(LocalAngles[1])) * VecForward[1]) + (Math.cos(degToRad(LocalAngles[1])) * VecForward[0])) * 200;
                cmdMove[1] = ((Math.cos(degToRad(LocalAngles[1])) * -VecForward[1]) + (Math.sin(degToRad(LocalAngles[1])) * VecForward[0])) * 200;
            }

            UserCMD.SetMovement(cmdMove);
        } else {
            var cmdMove = [0, 0, 0];
            var DiffYaw = otherYaw - LocalAngles[1];

            if (DiffYaw > 180) {
                DiffYaw = DiffYaw - 360;
            } else if (DiffYaw < -180) {
                DiffYaw = DiffYaw + 360;
            }

            if (TargetSpeed > 285 && getUIVal(UIBHop)) {
                cmdMove[0] = -Math.abs(TargetSpeed);
            }

            if (blockbotModes[getUIVal(UIMode)] == MODE_MATCH_SPEED) {
                if (Math.abs(DiffYaw) > 0.75) {
                    cmdMove[1] = 450 * -DiffYaw;
                }
            } else if (blockbotModes[getUIVal(UIMode)] == MODE_MAX_SPEED) {
                if (DiffYaw > 0.25) {
                    cmdMove[1] = -450;
                } else if (DiffYaw < -0.25) {
                    cmdMove[1] = 450;
                }
            }

            UserCMD.SetMovement(cmdMove);
        }
    }
}
Global.RegisterCallback("Draw", "OnFrameMain");
Global.RegisterCallback("CreateMove", "OnCreateMoveMain");
//BetterDT By Vexatious Cheff
var last = 0
var shot = false
function lastShot(){
    if(Entity.GetLocalPlayer() == Entity.GetEntityFromUserID(Event.GetInt("userid")) && UI.IsHotkeyActive("Rage","GENERAL","Exploits","Doubletap")){
      
        last = Globals.Tickcount()
        shot = true
    }
}
var wasActive = true
var wasfding = false
var lastfding = 0
function cm(){
    if(!UI.GetValue("Script Items", "Fast DT Recharge") || (UI.IsHotkeyActive("Rage","GENERAL","Exploits","Hide shots") && !UI.IsHotkeyActive("Rage","GENERAL","Exploits","Doubletap"))){
        Exploit.EnableRecharge()
        return
    }
    Exploit.DisableRecharge()
    if(!UI.IsHotkeyActive("Rage","GENERAL","Exploits","Doubletap"))
    wasActive = false
    if(!wasActive && UI.IsHotkeyActive("Rage","GENERAL","Exploits","Doubletap")){
        Exploit.Recharge()
        wasActive = true
    }
    if(UI.IsHotkeyActive("Anti-Aim","Extra","Fake duck")){
        wasfding = true
        lastfding = Globals.Tickcount()
    }
    if(!UI.IsHotkeyActive("Anti-Aim","Extra","Fake duck") && wasfding && Globals.Tickcount() - 2 > lastfding){
        Exploit.Recharge()
        wasfding = false
    }
  
    if(last + 4 < Globals.Tickcount() && shot){
        Exploit.Recharge()
        shot = false
    }
}
function roundStart(){
    if(!UI.GetValue("Script Items", "Fast DT Recharge") || (UI.IsHotkeyActive("Rage","GENERAL","Exploits","Hide shots") && !UI.IsHotkeyActive("Rage","GENERAL","Exploits","Doubletap"))) return
    if(Exploit.GetCharge() != 0){
        Exploit.Recharge()
        last = Globals.Tickcount()
    }
}
Cheat.RegisterCallback("weapon_fire","lastShot")
Cheat.RegisterCallback("CreateMove","cm")
Cheat.RegisterCallback("round_start","roundStart")
Cheat.RegisterCallback("round_prestart","roundStart")
Cheat.RegisterCallback("round_end","roundStart")
//LegitAA (pasted from Eugen's AntiAim)
lbySwitch = false;
movefactor = 0;
manualSide = 0;
side = 0;
lby_side = 0;
direction = 0;
swap = 0;
received_key = false;
function vector_angles(target, eyepos)

{
    const vector_substract = function(vec1, vec2)
    {
        return [
            vec1[0] - vec2[0],
            vec1[1] - vec2[1],
            vec1[2] - vec2[2],
        ];
    };

    const ext = vector_substract(target, eyepos);

    const yaw = Math.atan2(ext[1], ext[0]) * 180 / Math.PI;
    const pitch = -(Math.atan2(ext[2], Math.sqrt(ext[0] ** 2 + ext[1] ** 2)) * 180 / Math.PI);

    return [pitch, yaw];
}
localplayer = {
    local() {
        return Entity.GetLocalPlayer();
    },
    health() {
        return Entity.GetHealth(localplayer.local());
    },
    moving() {
        return (entity.getVelocity(localplayer.local()) > 2);
    },
    dif() {
        fakeyaw = Local.GetFakeYaw();
        realyaw = Local.GetRealYaw();
        return Math.abs(realyaw - fakeyaw);
    },
    valid() {
        return Entity.IsValid(localplayer.local());
    }
}
entity = {
    getVelocity(e) {
        velocity = Entity.GetProp( e, "CBasePlayer", "m_vecVelocity[0]" );
        return Math.sqrt( velocity[0] * velocity[0] + velocity[1] * velocity[1] );
    },
    getVelocity3d(e) {
        return Entity.GetProp( e, "CBasePlayer", "m_vecVelocity[0]" );
    },
    getPos(e) {
        return Entity.GetRenderOrigin(e);
    },
    getClosestEnemy() {
        enms = Entity.GetEnemies();
        dist = 999999;
        enm = null;
        for (i = 0; i < 64; i++) {
            if (enms == undefined) break;
            pos = entity.getPos(enms);
            d = trace.distanceVector(Entity.GetRenderOrigin(localplayer.local()), pos);
            if (d < dist) {dist = d; enm = enms;} 
        }
        return [enm, dist];
    },
    getCrosshairEnemy() {
        enms = Entity.GetEnemies();
        dist = 999999;
        enm = null;
        for (i = 0; i < 64; i++) {
            if (enms == undefined) break;
            pos = entity.getPos(enms);
            pos2d = Render.WorldToScreen(pos);
            screen = Render.GetScreenSize();
            sx = screen[0] / 2;
            sy = screen[1] / 2;
            d = trace.distanceVector2d(pos2d, [sx, sy]);
            if (d < dist) {
                dist = d;
                enm = enms;
            }
        }
        return enm;
    }
}
trace = {
    distanceVector( v1, v2 )
    {
        var dx = v1[0] - v2[0];
        var dy = v1[1] - v2[1];
        var dz = v1[2] - v2[2];
        return Math.sqrt( dx * dx + dy * dy + dz * dz );
    },
    distanceVector2d( v1, v2 )
    {
        var dx = v1[0] - v2[0];
        var dy = v1[1] - v2[1];
        return Math.sqrt( dx * dx + dy * dy );
    },
    addVector(v1, v2) {
        var dx = v1[0] + v2[0];
        var dy = v1[1] + v2[1];
        var dz = v1[2] + v2[2];
        return [dx, dy, dz];
    },
    deg2rad( degress ) {
        return degress * Math.PI / 180.0;
    },
    rad2deg( rad ) {
        return rad * (Math.PI / 180.0);
    },
    angle_to_vec( pitch, yaw ) {
        var p = trace.deg2rad( pitch );
        var y = trace.deg2rad( yaw )
        var sin_p = Math.sin( p );
        var cos_p = Math.cos( p );
        var sin_y = Math.sin( y );
        var cos_y = Math.cos( y );
        return [ cos_p * cos_y, cos_p * sin_y, -sin_p ];
    },
    getDist(entity_id, entity_angles) {
        var entity_vec = trace.angle_to_vec( entity_angles[0], entity_angles[1] );
        var entity_pos = Entity.GetRenderOrigin( entity_id );
        entity_pos[2] += 50;
        var stop = [ entity_pos[ 0 ] + entity_vec[0] * 8192, entity_pos[1] + entity_vec[1] * 8192, ( entity_pos[2] )  + entity_vec[2] * 8192 ];
        var traceResult = Trace.Line( entity_id, entity_pos, stop );
        if( traceResult[1] == 1.0 )
        return;
        stop = [ entity_pos[ 0 ] + entity_vec[0] * traceResult[1] * 8192, entity_pos[1] + entity_vec[1] * traceResult[1] * 8192, entity_pos[2] + entity_vec[2] * traceResult[1] * 8192 ];
        var distance = Math.sqrt( ( entity_pos[0] - stop[0] ) * ( entity_pos[0] - stop[0] ) + ( entity_pos[1] - stop[1] ) * ( entity_pos[1] - stop[1] ) + ( entity_pos[2] - stop[2] ) * ( entity_pos[2] - stop[2] ) );
        entity_pos = Render.WorldToScreen( entity_pos );
        stop = Render.WorldToScreen( stop );
        return distance;
    }
}
AA = {
    enableOverride() {
        UI.SetValue("Anti-Aim", "Rage Anti-Aim", "At targets", 0)
        UI.SetValue("Anti-Aim", "Rage Anti-Aim", "Auto direction", 0)
        UI.SetValue("Anti-Aim", "Rage Anti-Aim", "Yaw offset", 0)
        UI.SetValue("Anti-Aim", "Rage Anti-Aim", "Jitter offset", 0)
        return AntiAim.SetOverride(1);
    },
    disableOverride() {
        return AntiAim.SetOverride(0);
    },
    getOverride() {
        return AntiAim.getOverride();
    },
    antiaims: {
        backLeft() {

            localplayer.moving() ? (
                AntiAim.SetFakeOffset(180),
                AntiAim.SetRealOffset(-60),
                AntiAim.SetLBYOffset(lbySwitch ? 0 : 90)
            ) : (
                AntiAim.SetFakeOffset(180),
                AntiAim.SetRealOffset(-60),
                AntiAim.SetLBYOffset(localplayer.dif() > 60 ? (lbySwitch ? 160 : 60) : 60)
            );
        },
        backRight() {

            localplayer.moving() ? (
                AntiAim.SetFakeOffset(180),
                AntiAim.SetRealOffset(60),
                AntiAim.SetLBYOffset(lbySwitch ? 0 : -90)
            ) : (
                AntiAim.SetFakeOffset(180),
                AntiAim.SetRealOffset(60),
                AntiAim.SetLBYOffset(localplayer.dif() > 60 ? (lbySwitch ? -160 : -60) : -60)
            );
        },
        manualSwitch() {
            t = UI.IsHotkeyActive("Misc", "JAVASCRIPT", "Script items", "Toggle");
            t ? AA.antiaims.backRight() : AA.antiaims.backLeft();
        },
        manualKeys() {
            l = UI.IsHotkeyActive("Misc", "JAVASCRIPT", "Script items", "Left");
            r = UI.IsHotkeyActive("Misc", "JAVASCRIPT", "Script items", "Right");
            if (l) side = 0;
            if (r) side = 1;
            side ? AA.antiaims.backRight() : AA.antiaims.backLeft();
        }
    }
}
//"noob dog" Killsay and custom killsay(Pasted From Athena's Killsay)
function on_player_death()
{
    var roasts = ['Toss me the pigskin, nephew', 'dude did i kill you with my decoy?', 'sus bro', 'you wanna try that again?', 'fallout boy sucks dick sum 41 gang', 'Stop trolling please', 'Whats your net worth retard','Get 1d bossman no suit no tie', 'Just toting this glizzy to the movies', 'Got that big iron on my hip', 'Buckets to tha rim fr fr', 'Ok Boogerbreath','Get dunked on','Let that sink in']
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
Global.RegisterCallback("player_death", "on_player_death");
//Auto Smoke by Rory
const actions = [
    [function() {Cheat.ExecuteCommand('use weapon_smokegrenade')}, 50],
    [function() {Cheat.ExecuteCommand('+attack2')}, 10],
    [function() {angles = Local.GetViewAngles(); Local.SetViewAngles([90, angles[1], angles[2]])}, 0],
    [function() {Cheat.ExecuteCommand('-attack2')}, 7],
    [function() {Local.SetViewAngles(angles)}, 0],
    [function() {Cheat.ExecuteCommand('slot3')}, 0],
    [function() {Cheat.ExecuteCommand('slot2')}, 0],
    [function() {Cheat.ExecuteCommand('slot1')}, 0]
];
const next = 0, angles = [], current = -1;

function on_tick() {
    if (current == -1 || Globals.Tickcount() <= next) return;
    actions[current][0]();
    next = Globals.Tickcount() + actions[current][1] * (Globals.Tickrate()/64);
    if (++current == actions.length) {
        next = 0;
        current = -1;
    }
} Cheat.RegisterCallback('CreateMove', 'on_tick');

function molotov_detonated() {
    if (!UI.IsHotkeyActive.apply(this, hotkey) || !Entity.IsAlive(Entity.GetLocalPlayer())) return;
    if (~Entity.GetTeammates().indexOf(Entity.GetEntityFromUserID(Event.GetInt('userid'))) && !Entity.IsLocalPlayer(Entity.GetEntityFromUserID(Event.GetInt('userid')))) return;
    const player_pos = Entity.GetRenderOrigin(Entity.GetLocalPlayer());
    const magnitude = Math.sqrt((Event.GetFloat('x') - player_pos[0]) ** 2 + (Event.GetFloat('y') - player_pos[1]) ** 2);
    if (magnitude <= 175 && Math.abs(Event.GetFloat('z') - player_pos[2]) <= 300) current = 0;
} Cheat.RegisterCallback('molotov_detonate', 'molotov_detonated');
Cheat.RegisterCallback('Draw', 'on_draw');

function DRAW() {
    e = UI.GetValue("LegitAA")
    UI.SetEnabled("mode", e);
    e ? AA.enableOverride() : AA.disableOverride();
    if (!e) return;
    if (!localplayer.valid()) return
    aa = 3
    UI.SetEnabled("Left", (aa == 3 && e));
    UI.SetEnabled("Right", (aa == 3 && e));
    if (aa == 0) AA.antiaims.backLeft();
    if (aa == 1) AA.antiaims.backRight();
    if (aa == 3) AA.antiaims.manualKeys();

}
//pasted from Zeus HC by iszaar
var beforeHT = UI.GetValue("Rage", "GENERAL", "Accuracy", "Hitchance");
var beforeAB = UI.GetValue("Rage", "GENERAL", "Accuracy", "Accuracy boost");
function zeusHCAC() {
if (UI.GetValue( "Misc", "JAVASCRIPT", "Script items", "ZeusHitchance")) {
    player = Entity.GetLocalPlayer(); weapon = Entity.GetWeapon(player); weaponName = Entity.GetName(weapon);
    if (weaponName.includes("zeus")) {
            UI.SetValue( "Rage", "GENERAL", "Accuracy", "Hitchance", UI.GetValue("Misc", "JAVASCRIPT", "Script items", "Accuracy Boost"))
            UI.SetValue( "Rage", "GENERAL", "Accuracy", "Accuracy boost", UI.GetValue("Misc", "JAVASCRIPT", "Script items", "Hitchance"))
        }else {
            UI.SetValue( "Rage", "GENERAL", "Accuracy", "Hitchance", beforeHT )
            UI.SetValue( "Rage", "GENERAL", "Accuracy", "Accuracy boost", beforeAB )
    }
  }
}

Global.RegisterCallback("Draw", "zeusHCAC");
//pasted from ChimpStoreWorker's Spin JS
var spin = 0;

function wrap(val, min, max) {
    var dif = max - min;
    
    while (val > max) val -= dif;
    while (val < min) val += dif;
    
    return val;
}

function create_move() {
    var enabled = UI.GetValue("Misc", "JAVASCRIPT", "Script Items", "Spin AA");
    var speed = UI.GetValue("Misc", "JAVASCRIPT", "Script Items", "Spin Speed");
    if (enabled) {
        UI.SetValue("Anti-Aim", "Rage Anti-Aim", "Yaw offset", spin);
        
        spin = wrap(spin + speed, -180, 180)
    }
}

Global.RegisterCallback("CreateMove", "create_move");
// pasted from Yuca's gamesense watermark (credit to estamaloka for the code)

function hsv_to_rgb(h, s, v)
{
    var r, g, b, i, f, p, q, t;
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}
function getCustomValue(xy) {
var value = UI.GetValue("MISC", "JAVASCRIPT", "Script items", xy);
return value;}
var position = {
  x1: 0,
  y1: 0
}

function draw_wm_rect(x, y, width, height)
{
        var rgbcolor = hsv_to_rgb(Global.Realtime() * UI.GetValue("MISC", "JAVASCRIPT", "Script Items", "Gradient Speed"), 1, 1);

}

function draw_wm_rect2(x2, y2, width2, height2)
{
        var rgbcolor = hsv_to_rgb(Global.Realtime() * UI.GetValue("MISC", "JAVASCRIPT", "Script Items", "Gradient Speed"), 1, 1);

      Render.Rect( x2 + 45, y2 + 2, width2 + 120, height2 + -10, [ rgbcolor.g, rgbcolor.b, rgbcolor.r, 200 ] );
     Render.FilledRect( x2 + 46, y2 + 3, width2 + 118, height2 + -10, [ 55, 55, 55, 200 ] );
     Render.FilledRect( x2 + 50, y2 + 7, width2 - -110, height2 - 19, [ 30, 30, 30, 200 ] ); // black
      Render.Rect( x2 + 50, y2 + 6, width2 - -110, height2 + -17, [ rgbcolor.g, rgbcolor.b, rgbcolor.r, 200 ] );
}


function draw_gs_watermark()
{
  var rgbcolor = hsv_to_rgb(Global.Realtime() * UI.GetValue("MISC", "JAVASCRIPT", "Script Items", "Gradient Speed"), 1, 1);
  var fps1 = 1 / Global.Frametime()
  var fps = Math.floor(fps1)
  var watermark_name = Entity.GetName(Entity.GetLocalPlayer( ));
  var today = new Date();
  var datetime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    x1 = 1760;
    y1 = 5;





    draw_wm_rect(x1, y1, 40, 35);
    draw_wm_rect2(x1 - 150, y1, 140, 35);
    Render.String( x1 + -51, y1 + 10, 0, "sense", [ 166, 243, 65, 255], 8 );
    Render.String( x1 + -94, y1 + 10, 0, "andrew", [ 255, 255, 255, 255], 8 );
    Render.String( x1 + 64, y1 + 10, 0, "|", [ 255, 255, 255, 255], 8 );
    Render.String( x1 - -30, y1 + 10, 0, "" + fps, [ 166, 243, 65, 255], 8 );
    Render.String( x1 - 8, y1 + 10, 0, "fps |", [ 255, 255, 255, 255], 8 );
    Render.String( x1 + 78, y1 + 10, 0, " " + datetime, [ 255, 255, 255, 255 ], 8 );

}

function main()
{
        var screensize = Global.GetScreenSize();
}
main()

Global.RegisterCallback("Draw", "draw_gs_watermark")
Cheat.RegisterCallback("Draw", "DRAW");
UI.AddLabel("Andrewsense Utilities");
UI.AddLabel("______________________________________");
UI.AddCheckbox("LegitAA");
UI.AddHotkey("Left");
UI.AddHotkey("Right");
UI.AddLabel("______________________________________");
UI.AddCheckbox("Noob Dog Killsay");
UI.AddLabel("______________________________________");
UI.AddCheckbox("ZeusHitchance"); 
UI.AddSliderFloat("Hitchance", 1, 100);
UI.AddSliderFloat("Accuracy Boost", 1, 100);
UI.AddLabel("______________________________________");
UI.AddCheckbox("Spin AA");
UI.AddSliderInt("Spin Speed", -200, 200);
UI.AddLabel("______________________________________");
const hotkey = UI.AddHotkey('Auto Smoke');
UI.AddLabel("______________________________________");
UI.AddCheckbox("Fast DT Recharge")
UI.AddLabel("______________________________________");
UI.AddHotkey(UIDoBlock);
UI.AddHotkey(UIOnKey);
UI.AddDropdown(UIMode, blockbotModes);
UI.AddCheckbox(UIBHop);
UI.AddLabel("______________________________________");
UI.SetEnabled("Left", 0);
UI.SetEnabled("Right", 0);
