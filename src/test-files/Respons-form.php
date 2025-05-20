<?php

$form = \Easy\Form::fromHtml(<<<'HTML'
    <form name="test" class="formi" method="post">
        <fieldset class="multi-demo" style="width:fit-content" formi-multiple-name="demo" formi-multiple-maximum="3" formi-multiple-add-button="➕ Demo group">
            <div>
                <label for="name">Name:</label>
                <input type="text" name="name" id="name">
            </div>
            <div>
                <label for="message">Message:</label><br>
                <textarea name="message" id="message" cols="30" rows="4"></textarea>
            </div>
        </fieldset>
        <div>
            <input type="checkbox" name="newsletter" id="newsletter">
            <label for="newsletter">Subscribe?</label><br><br>
        </div>
        <button>Submit</button>
        <div id="log">
            test
            <br>
            test2
        </div>
    </form>
HTML);

echo $form->toJson(JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);