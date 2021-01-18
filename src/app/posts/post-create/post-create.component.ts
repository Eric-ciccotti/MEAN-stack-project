import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  enteredContent = "";
  enteredTitle = "";
  post: Post;
  private mode = "create";
  spinnerLoading = false;
  private postId: string | null;

  // @Output()  postCreated = new EventEmitter<Post>();

  ngOnInit(): void {
    //on regarde sur la route change, et si il y a un "postId" en fonction de ça on change de mode
    //si on est en mode edit on récupère le post via le service
    //le point ! c'est pour que typescript même si il voit que c'est null me "fasse confiance"
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = "edit";
        this.postId = paramMap.get('postId');
        this.spinnerLoading = true;
        setTimeout(() => {},2000);
        this.postsService.getPost(this.postId).subscribe(postData => {
          //mettre la propriété du spinner ici dans le subscribe
          this.spinnerLoading = false;
          //data coming from database donc postData._id
          this.post = {id: postData._id, title: postData.title, content: postData.content};
        })
      } else {
        this.mode = "create";
        this.postId = null;
      }
    });
  }

  onSavePost(form: NgForm) {
    if (form.invalid) {
      return;
    }

    //pas la peine de le false car on navigue ailleurs
    this.spinnerLoading = true;

    if (this.mode === "create") {
      this.postsService.addPost(form.value.title, form.value.content);
    } else {
      this.postsService.updatePost(
        this.postId,
        form.value.title,
        form.value.content);
    }
    form.resetForm();
  }

  constructor(public postsService: PostsService, public route: ActivatedRoute) {}



}
