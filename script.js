var repositories = {
    "docker/docker": {"raise": 150000000, "name": "Docker"},
    "PrestaShop/PrestaShop": {"raise": 14800000, "name": "PrestaShop"}
};

$(function() {
    var reference = $('select[name="reference"]');
    for (var repo_name in repositories) {
        reference.append($("<option>").attr("value", repo_name).text(repositories[repo_name]["name"]));
    }
});


function getRepo(repository) {
    var promise = $.Deferred();
    $.get("https://api.github.com/repos/" + repository, function(answer) {
        promise.resolve(answer);
    }).fail(function(error) {
        promise.reject(error);
    });
    return promise;
}

function onSubmit() {
    var repo = $('input[name="repository"]').val();
    var reference = $('select[name="reference"]').val();


    $.when(getRepo(repo), getRepo(reference)).done(function(repo, reference) {
        var stats = $("#stats");
        console.log(repo);
        stats.html("");
        stats.append($("<h1>").text(reference["name"] + " / " + repo["name"]));
        stats.append($("<p>").html(reference["watchers_count"] + " &#x2605; / " + repo["watchers_count"] + " &#x2605;"));
        var raise = repositories[reference["full_name"]]["raise"];
        var valuation = Math.round(raise / reference["watchers_count"] * repo["watchers_count"]);
        stats.append($("<p>").text(valuation.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + " $ of fund raising"));
        //TODO: Display watcher price
    });

    return false;
}

