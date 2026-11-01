function reply() {

    let q = document.getElementById("question").value.toLowerCase();
    let ans = "";

    if(q.includes("resume")){
        ans = "Make your resume ATS Friendly.";
    }
    else if(q.includes("skill")){
        ans = "Learn HTML, CSS, JavaScript, Node.js and SQL.";
    }
    else if(q.includes("interview")){
        ans = "Practice aptitude and communication daily.";
    }
    else{
        ans = "Sorry! I don't know this answer yet.";
    }

    document.getElementById("answer").innerHTML = ans;
}